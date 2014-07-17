/**
 *
 */
var OPTIONS = {
    sort: 'isObject',
    skip: 'isNumber' ,
    limit: 'isNumber',
    fields: 'isObject',
    reactive: 'isBoolean',
    transform: 'isFunction'
};

SubscribeReactive = function(opt){
    var self = this;
    self._deps = new Deps.Dependency;
    self._options = {};
    self._query = {};
    _.each(opt, function(v, k){
        if(k == 'collection')
            self._collection = opt.collection;
        if(k == 'query')
            self.setQuery(opt.query);
        if(k == 'options')
            self.setOptions(opt.options);
    });
};
_.extend(SubscribeReactive.prototype, {
    _getCollection: function(){
        var self = this;
        if(!_.isString(self._collection))
            throw new Error('collection is invalid');
        return window[self._collection];
    },
    setCollection: function(collection){
        var self = this;
        if(!_.isString(self._collection))
            throw new Error('collection is invalid');
        self._collection = collection;
    },
    find: function(){
        var self = this;
        var collection = self._getCollection();
        self._cursor = collection.find(
            self.getQuery(),
            self.getOptions()
        );
        return self._cursor;
    },
    /**
     * QUERY
     */
    getQuery: function(key){
        var self = this;
        self._deps.depend();
        return self.getNonQuery(key);
    },
    getNonQuery: function(key){
        var self = this;
        var query = self._query;
        if(self._correctQueryList && self._correctQueryList.length > 0){
            _.each(self._correctQueryList, function(func){
                query = func(query);
            });
        }
        if(_.isString(key))
            return query[key];
        return _.clone(query);
    },
    correctQuery: function(func){
        var self = this;
        if(!_.isFunction(func))
            throw new Error('params must be function');
        self._correctQueryList = self._correctQueryList || [];
        self._correctQueryList.push(func);
    },
    filterQuery: function(func){
        var self = this;
        if(!_.isFunction(func))
            throw new Error('params must be function');
        self._filterQueryList = self._filterQueryList || [];
        self._filterQueryList.push(func);
    },
    setQuery: function(key, value){
        var self = this;
        if(_.isObject(key))
            _.each(key, function(v, k){
                self.setQuery(k, v);
            });
        else {
            if(!_.isString(key))
                throw new Error('key must be a string');
            if(_.isNull(value) || _.isUndefined(value))
                throw new Error(key + ' invalid');
            self._query[key] = value;
            if(self._filterQueryList && self._filterQueryList.length > 0){
                _.each(self._filterQueryList, function(func){
                    func.call(self, self._query);
                });
            }
        }
    },
    removeQuery: function(key){
        var self = this;
        if(!_.isString(key))
            throw new Error('key must be a string');
        if(!_.isUndefined(self._query[key])){
            self._query[key] = null;
            delete self._query[key]
        }            
    },
    /**
     * Reactive
     */
    changed: function(){
        if(_.isFunction(this._callback)){
            this._callback();
        }
        this._deps.changed();
    },
    afterChange: function(cb){
        if(_.isFunction(cb)){
            this._callback = cb;
        }
    },
    /**
     * options
     */
    getOptions: function(key){
        if(_.isString(key))
            return this._options[key];
        return this._options;
    },
    setOptions: function(key, value){
        var self = this;
        if(_.isObject(key))
            _.each(key, function(v, k){
                self.setOptions(k, v);
            });
        else {
            if(!_.isString(key))
                throw new Error('key must be a string');
            if(_.isNull(value) || _.isUndefined(value))
                throw new Error(key + ' invalid');
            if(_.isUndefined(OPTIONS[key]))
                throw new Error(key + 'is invalid');
            if(!_[OPTIONS[key]](value))
                throw new Error(key + 'is invalid');
            self._options[key] = value;
        }
    },
    loadMore: function(publicationName){
        var self = this;
        var tmp = self.getOptions('limit');
        self.setOptions('limit', tmp + 20);
        self._subscribe(publicationName);
    },
    _subscribe: function(publicationName){
        var self = this;
        var old = null;
        if(self._handle)
            old = self._handle;
        self._handle = Meteor.subscribe(
            publicationName,
            self.getNonQuery(),
            self.getOptions('limit'),
            {
                onError: function(err){
                    console.error(err.message);
                },
                onReady: function(){
                    self.changed();
                    if(old){
                        old.stop();
                        old = null;
                    }
                }
            }
        );
    }
});

/**

TestCase.addTestSync('SubscribeReactive - _getCollection', function(assert){
    var qr = new SubscribeReactive({
        collection: 'FreeAgentMatches',
        query: {
            status: {$in: [SC.OPEN, SC.SCHEDULED]},
            invite: false,
            matchType: {$in: [SC.H2H, SC.MPLAYER]}
        },
        options: {
            sort: {
                updated: 1,
                name: -1
            },
            limit: 10
        }
    });
    var c = qr._getCollection();
    assert.equal(c._name, "freeAgentMatches");
});

TestCase.addTestSync('SubscribeReactive - correctQuery', function(assert){
    var qr = new SubscribeReactive({
        collection: 'FreeAgentMatches',
        query: {
            status: {$in: [SC.OPEN, SC.SCHEDULED]},
            invite: false,
            matchType: {$in: [SC.H2H, SC.MPLAYER]}
        },
        options: {
            sort: {
                updated: 1,
                name: -1
            },
            limit: 10
        }
    });
    assert.equal(qr._correctQueryList, undefined);
    qr.correctQuery(function(query){
        if(!query.invite)
            query.invite = true;
        return query;
    });
    qr.correctQuery(function(query){
        if(query.invite)
            query.invite = 'true';
        return query;
    });
    var q = qr.getQuery();
    assert.equal(q.invite, "true");
});

TestCase.addTestSync('SubscribeReactive - setQuery', function(assert){
    var qr = new SubscribeReactive({
        collection: 'FreeAgentMatches',
        query: {
            status: {$in: [SC.OPEN, SC.SCHEDULED]},
            invite: false,
            matchType: {$in: [SC.H2H, SC.MPLAYER]}
        },
        options: {
            sort: {
                updated: 1,
                name: -1
            },
            limit: 10
        }
    });
    qr.filterQuery(function(query){
        var self = this;
        _.each(query, function(value, key){
            if(key == 'name' && (value != '' && value != null && value != undefined)){
            }
            else if(key == 'name'){
                this.removeQuery(key);
            }
        }, self);
    });
    qr.setQuery({
        name: ''
    });
    assert.equal(qr.getQuery('name'), undefined);
    qr.setQuery({
        name: 'abc'
    });
    assert.equal(qr.getQuery('name'), 'abc');
});

TestCase.addTestSync('SubscribeReactive - setOptions', function(assert){
    var qr = new SubscribeReactive({
        collection: 'FreeAgentMatches',
        query: {
            status: {$in: [SC.OPEN, SC.SCHEDULED]},
            invite: false,
            matchType: {$in: [SC.H2H, SC.MPLAYER]}
        },
        options: {
            sort: {
                updated: 1,
                name: -1
            },
            limit: 20
        }
    });
    qr.setOptions({});
    assert.equal(qr.getOptions('limit'), 20);
    qr.setOptions({'limit': 123});
    assert.equal(qr.getOptions('limit'), 123);
});

Meteor.setTimeout(function(){

TestCase.addTestSync('SubscribeReactive - find', function(assert){
    var qr = new SubscribeReactive({
        collection: 'FreeAgentMatches',
        query: {
            status: {$in: [SC.OPEN, SC.SCHEDULED]},
            invite: false,
            matchType: {$in: [SC.H2H, SC.MPLAYER]}
        },
        options: {
            sort: {
                updated: 1,
                name: -1
            },
            limit: 10
        }
    });
    assert.equal(qr.find().count(), 10);
    qr.setOptions({'limit': 20});
    assert.equal(qr.find().count(), 20);
    Deps.autorun(function(){
        console.log(qr.find().count(), 'kakakakakaka');
    });
    qr.setQuery('invite', true);
    qr.changed();
});

}, 3000);
 */