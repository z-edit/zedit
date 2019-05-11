ngapp.run(function(viewFactory) {
    viewFactory.registerView({
        id: 'newTabView',
        new: function() {
            return {
                templateUrl: 'partials/newTabView.html',
                controller: 'newTabViewController',
                class: 'new-tab-view',
                label: 'New Tab',
                destroy: () => {}
            }
        },
        isAccessible: () => false
    });
});
