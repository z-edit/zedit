ngapp.service('logViewFactory', function(viewFactory) {
    this.new = function() {
        return viewFactory.new('logView');
    };
});

ngapp.run(function(viewFactory, logViewFactory) {
    viewFactory.registerView({
        id: 'logView',
        name: 'Log View',
        new: logViewFactory.new,
        isAccessible: () => true
    });
});
