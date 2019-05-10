ngapp.service('newTabViewFactory', function() {
    this.new = function() {
        return {
            templateUrl: 'partials/newTabView.html',
            controller: 'newTabViewController',
            class: 'new-tab-view',
            label: 'New Tab',
            destroy: () => {}
        }
    };
});

ngapp.run(function(viewFactory, newTabViewFactory) {
    viewFactory.registerView({
        id: 'newTabView',
        new: newTabViewFactory.new,
        isAccessible: () => false
    });
});
