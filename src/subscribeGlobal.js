SubscribeGlobal = (function(){
    var list = {};
    return {
        subscribe: function(router /* same as Meteor.subscribe */){
            var self = router;
            var waitApi = (function () {
                var added = false;
                return {
                    wait: function () {
                        // make idempotent
                        if (!added) {
                            self._waitList.push(this);
                            added = true;
                        }
                    }
                };
            })();
            var handle = SubscribeGlobal.checkOn.apply(SubscribeGlobal, Array.prototype.slice.call(arguments, 1));
            return _.extend(handle, waitApi);
        },
        subscribeWithoutRouter: function(/* same as Meteor.subscribe */){
            var handle = SubscribeGlobal.checkOn.apply(SubscribeGlobal, Array.prototype.slice.call(arguments, 0));
            return handle;
        },
        checkOn: function(name){
            var self = this;
            if(!list[name] || !list[name].ready()){
                list[name] = Meteor.subscribe.apply(this, arguments);
            }
            list[name]._stop = list[name].stop;
            list[name].name = name;
            list[name].stop = function(){
                //console.log('Call SubscribeGlobal.stop(' + name + ') instead.');
            };
            return list[name];
        },
        stop: function(name){
            if(list[name]){
                list[name]._stop();
                list[name] = null;
            }
        }
    };
})();