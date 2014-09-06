FakeSubscription = (function(){
    var dep_ = new Deps.Dependency(),
    isReady = true,
    currentRouterName = null,
    once = function(){};
    // https://github.com/meteor/meteor/blob/devel/packages/livedata/livedata_connection.js#L533
    return {
        stop: function(){

        },
        ready: function(){
            dep_.depend();
            return isReady;
        },
        set: function(v){
            if(isReady != !!v){
                isReady = !!v;
                dep_.changed();
            }
        },
        notReady: function(cb){
            var self = this;
            var c = Router.getCurrentRouterName();
            if(!currentRouterName || c !== currentRouterName){
                currentRouterName = c;
                once = _.once(function(){
                    self.set(false);
                    cb(function(){
                        self.set(true);
                    });
                });
            }
            once();
        }
    };
})();

/**
var IRBeforeHooks = {
    controlRouter: function (pause) {
        var self = this;
        self._waitList.push(FakeSubscription);
    }
};

   this.route('verifyEmail',{
        path    : '/verify-email/:token',
        template: 'verifyEmailPage',
        layoutTemplate: 'singlePageLayout',
        yieldTemplates: {},
        onBeforeAction: function(){
            var self = this;
            var token = self.params.token;
            FakeSubscription.notReady(function(done){
                Accounts.verifyEmail(token, function(err){
                    if(err){
                        APP.namespace('Notification').newMessage({
                            title: 'Error',
                            message: err.reason,
                            template: Template.messageError
                        }).show().clear(7);
                    } else {
                        APP.namespace('Notification').newMessage({
                            title: 'Success',
                            message: "message",
                            template: Template.messageSuccess
                        }).show().clear(7);
                    }
                    done();
                });
            });
        }
    });
*/
