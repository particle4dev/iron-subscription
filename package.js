Package.describe({
    summary: "subscription-manager for iron router"
});
// meteor test-packages ./
var both = ['client', 'server'];
var client = ['client'];
var server = ['server'];
Package.on_use(function (api) {
    api.use('underscore', client);
    api.add_files([
        'src/subscribeReactive.js',
        'src/subscribeChain.js',
        'src/subscribeGlobal.js'
    ], client);
    if (typeof api.export !== 'undefined') {
        api.export('SubscribeReactive', client);
        api.export('SubscribeChain', client);
        api.export('SubscribeGlobal', client);
    }
});
Package.on_test(function (api) {
    api.use(['test-helpers', 'tinytest'], client);

    api.add_files([
    ], client);
});