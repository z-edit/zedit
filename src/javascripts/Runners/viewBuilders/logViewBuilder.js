ngapp.run(function(viewFactory) {
    viewFactory.registerView({
        id: 'logView',
        name: 'Log View',
        new: function() {
            return viewFactory.new('logView');
        },
        isAccessible: () => true
    });
});
