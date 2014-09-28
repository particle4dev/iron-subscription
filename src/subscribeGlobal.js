SubscribeGlobal = (function(){
    var list = {};
    return {
        subscribe: function(router /* same as Meteor.subscribe */){
            var self = router;
            // https://github.com/EventedMind/iron-router/blob/bb5a9308b34dea74cb71235190b98b7c7f5e5d52/lib/route_controller_client.js#L240
            var waitApi = (function () {
                var added = false;
                return {
                    wait: function () {
                        // make idempotent
                        if (!added) {
                            self.wait(this);
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