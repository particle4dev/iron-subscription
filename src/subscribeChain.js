SubscribeChain = function(opt){
    var self = this;
    if (self._init) {
        self._init.apply(self, [opt]);
    }
};
_.extend(SubscribeChain.prototype, {
    constructor: SubscribeChain,
    _init: function(opt){
        var self = this;
        self._subscribeList = {};
        self._handles = {};
        opt = opt | {};

        if(!_.isUndefined(opt.autoload))
            self._autoload = !!opt.autoload;
        else
            self._autoload = true;
        self._isRun = false;
        self._currentSubscribeItem = null;
        self._readyDeps = new Deps.Dependency();
    },
    destruct: function(){
        var self = this;
        self.stop();
        self._subscribeList = {};
        self._handles = {};
        self._isRun = false;
    },
    stop: function(){
        var self = this;
        _.each(self._handles, function(v, k){
            if (v) {
                self._handles[k].stop();
                self._handles[k] = null;
            }
        });
        self._isRun = false;
    },
    ready: function(){
        var self = this,
        ready = null;
        _.each(self._handles, function(v, k){
            if (v && ready !== false) {
                ready = self._handles[k].ready();
            }
        });
        self._readyDeps && self._readyDeps.depend();
        return !!ready;
    },
    register: function( obj ){
        var self = this;
        if(!_.isFunction( obj.func ))
            throw new Error('func must be function.');
        if(!_.isString( obj.name ))
            throw new Error('name must be string');
        this._subscribeList[obj.name] = obj;
        this._handles[obj.name] = null;

        if(self._autoload && !self._isRun){
            Meteor.setTimeout(function(){
                self.load();
            }, 0);
        }
    },
    _pickOneSubscribe: function(){
        var key = null,
        self = this;
        _.each(this._handles, function(v, k){
            if(!v && this._subscribeList[k] && !key){
                // check dependence
                var depSub = this._handles[this._subscribeList[k].after];
                if((depSub && depSub.ready()) || !depSub) {
                    key = k;
                }
            }
        }, this);
        self._currentSubscribeItem = key;
        return key;
    },
    subscribe: function(name, param){
        var self = this;
        var registerName = (self._currentSubscribeItem !== null) ? self._currentSubscribeItem: name;

        self._handles[registerName] = Meteor.subscribe(name, param, {
            onError: function (error) {
                DEBUGX.error('[subscriptions][SubscribeChain]', registerName);
                self.stop();
                if(self._onError)
                    self._onError.call(this, error, registerName);
            },
            onReady: function () {
                DEBUGX.info('[subscriptions][SubscribeChain]', registerName);
                self.load();
            }
        });
    },
    load: function(){
        var self = this;
        var sub = self._pickOneSubscribe();
        self._isRun = true;
        if (sub) {
            self._subscribeList[sub].func.call(self, sub);
        }
        else if (sub === null && self.ready()) {
            if(self._onReady)
                self._onReady.call(self);
            self._isRun = false;
            self._readyDeps.changed();
        }
        else if (sub === null)
            Meteor.setTimeout(function(){
                self.load();
            }, 0);
    },
    onError: function(func){
        var self = this;
        self._onError = func;
    },
    onReady: function(func){
        var self = this;
        self._onReady = func;
    }
});
