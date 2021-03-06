SubscribeChain = function(opt){
    var self = this;
    if (self._init) {
        self._init(opt);
    }
};
_.extend(SubscribeChain.prototype, {
    constructor: SubscribeChain,
    _init: function(opt){
        var self = this;
        self._subscribeList = {};
        self._handles = {};
        opt = opt || {};
        if(!_.isUndefined(opt.autoload))
            self._autoload = !!opt.autoload;
        else
            self._autoload = true;
        self._isRun = false;
        self._currentSubscribeItem = null;
        self._readyDeps = new Tracker.Dependency();
        this._start = _.once(function () {
            this.load();
        }.bind(this));
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
            setTimeout(function(){
                self._start();
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
                if((depSub && depSub.ready()) || !this._subscribeList[k].after) {
                    key = k;
                }
            }
        }, this);
        self._currentSubscribeItem = key;
        return key;
    },
    subscribe: function(name){
        var self = this;
        var registerName = (self._currentSubscribeItem !== null) ? self._currentSubscribeItem: name;
        var params = Array.prototype.slice.call(arguments);

        params.push({
            onError: function (error) {
                console.error('[subscriptions][SubscribeChain]', registerName);
                self.stop();
                if(self._onError)
                    self._onError.call(this, error, registerName);
            },
            onReady: function () {
                console.info('[subscriptions][SubscribeChain]', registerName);
                self.load();
            }
        });
        self._handles[registerName] = Meteor.subscribe.apply(Meteor, params);
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
            setTimeout(function(){
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
