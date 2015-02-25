Package.describe({
    summary: "subscription-manager for iron router",
    version: "1.2.4",
    name: "particle4dev:iron-subscription",
    git: "https://github.com/particle4dev/iron-subscription.git"
});

// meteor test-packages ./
var both = ['client', 'server'];
var client = ['client'];
var server = ['server'];

Package.on_use(function(api) {
    api.versionsFrom("METEOR@0.9.0");
    api.use(['underscore', 'tracker'],  client);
    api.add_files([
        'src/fakeSubscription.js',
        'src/subscribeReactive.js',
        'src/subscribeChain.js',
        'src/subscribeGlobal.js',
        'src/subscribeMore.js'
    ], client);
    if (typeof api.export !== 'undefined') {
        api.export('SubscribeReactive', client);
        api.export('SubscribeChain', client);
        api.export('SubscribeGlobal', client);
        api.export('FakeSubscription', client);
        api.export('SubscribeMore', client);
    }
});

Package.on_test(function(api) {
    api.use(['test-helpers', 'tinytest'], client);
    api.add_files([
    ], client);
});
