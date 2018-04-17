ngapp.service('logViewFactory', function(viewFactory) {
    this.new = function() {
        return viewFactory.new('logView');
    };
});

ngapp.run(function(viewFactory, logViewFactory) {
    viewFactory.registerView('logView', logViewFactory.new, 'Log View');
});
