/**
 * Class making something fun and easy.
 * @constructor
 * @extends {}
 */
SubscribeMore = function(){
    this._isStarted = false;
    this._readyDeps = new Tracker.Dependency;
    this._subscribeList = [];
    this._waitOnReadySubscribeList = [];
    this._lastParam;
    this._generateParam = function (more) {
        return more;
    };
    this._doSubscribe = function () {
        return {
            ready: function () {
                return true;
            },
            stop: function () {}
        };
    };
};

_.extend(SubscribeMore.prototype, {
    constructor: SubscribeMore,
    /**
     * 
     * 
     * @param {} 
     * @return {}
     */
    start: function () {
        if(!this._isStarted) {
            this._lastParam = this._generateParam(this._lastParam);
            var sub = this._doSubscribe(this._lastParam);
            this._subscribeList.push(sub);
            // FIXME: check sub
            // ready
            // stop
            this._isStarted = true;
        }
    },
    /**
     * 
     * 
     * @param {} 
     * @return {}
     */
    stop: function () {
        if(this._isStarted) {
            _.each(this._subscribeList, function(v, k){
                v.stop();
            });
            this._subscribeList = [];
            this._waitOnReadySubscribeList = [];
            this._isStarted = false;
        }
    },
    /**
     * 
     * 
     * @param {} 
     * @return {Boolean}
     */
    ready: function () {
        var ready = null;
        _.each(this._waitOnReadySubscribeList, function(v, k){
            if (v && ready != false) {
                ready = v.ready();
            }
        });
        this._readyDeps && this._readyDeps.depend();
        return !!ready;
    },
    /**
     * 
     * 
     * @param {} 
     * @return {Boolean}
     */
    loadMore: function () {
        if(!this._isStarted) {
            throw new Error('object need start first');
        }
        this._lastParam = this._generateParam(this._lastParam);
        var sub = this._doSubscribe(this._lastParam);
        this._subscribeList.push(sub);
        // FIXME: check sub
        // ready
        // stop
    },
    /**
     * 
     * 
     * @param {} 
     * @return {}
     */
    waitOnReady: function (sub) {
        this._waitOnReadySubscribeList.push(sub);
        this._readyDeps.changed();
    },
    /**
     * 
     * Define a function that will run 
     * @param {} 
     * @return {}
     */
    subscribe: function(callback){
        this._doSubscribe = callback;
    },
    /**
     * 
     * Define a param that will send with sub
     * @param {} 
     * @return {}
     */
    nextLoadMore: function (callback) {
        this._generateParam = callback;
    },
    /**
     * 
     * Get param that will send with sub
     * @param {} 
     * @return {}
     */
    getParam: function () {
        return this._lastParam;
    },
    /**
     * 
     * Set a param that will send with sub
     * @param {} 
     * @return {}
     */
    setParam: function (obj) {
        this._lastParam = obj;
    }
});

// TEST
// Meteor.startup(function () {
// window.aza = new SubscribeMore();

// aza.subscribe(function(more){
        
//     if(!this._isStarted) {
//         //first time
//         var sub = new SubscribeChain({
//             autoload: false
//         });
//         sub.register({
//             name: 'matchPreviews',
//             after: null,
//             func: function(){
//                 this.subscribe('matchPreviews');
//             }
//         });
//         sub.register({
//             name: 'profilesById',
//             after: 'matchPreviews',
//             func: function(){
//                 var profilesId = [];
//                 MatchingScoreCollection.find().forEach(function (doc) {
//                     profilesId.push(doc.profileId);
//                 });
//                 this.subscribe('profilesById', profilesId);
//             }
//         });
//         sub.onReady(function(){
//         });
//         sub.onError(function(error, name){
//             console.error(error, name);
//         });
            
//         this.waitOnReady(sub);

//         sub.load();
//         return sub;
//     }
//     else {
//         var sub = new SubscribeChain({
//             autoload: false
//         });
//         sub.register({
//             name: 'matchPreviews',
//             after: null,
//             func: function(){
//                 this.subscribe('matchPreviews', more);
//             }
//         });
//         sub.register({
//             name: 'profilesById',
//             after: 'matchPreviews',
//             func: function(){
//                 var profilesId = [];
//                 MatchingScoreCollection.find().forEach(function (doc) {
//                     profilesId.push(doc.profileId);
//                 });
//                 this.subscribe('profilesById', profilesId);
//             }
//         });
//         sub.onReady(function(){
//         });
//         sub.onError(function(error, name){
//             console.error(error, name);
//         });

//         sub.load();
//         return sub;
//     }
// });

// aza.nextLoadMore(function(more){
//     if(_.isUndefined(more))
//         return 0;
//     return (more + 20);
// });

// aza.start();
// });

// aza.loadMore();
