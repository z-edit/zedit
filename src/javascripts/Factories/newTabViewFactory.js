ngapp.service('newTabViewFactory', function(controllerRegistry) {
    this.new = function() {
        return {
            templateUrl: 'partials/newTabView.html',
            controller: controllerRegistry.get('newTabViewController'),
            class: 'new-tab-view',
            data: { tabLabel: 'New Tab' },
            destroy: () => {}
        }
    };
});

ngapp.run(function(viewFactory, newTabViewFactory) {
    viewFactory.registerView('newTabView', newTabViewFactory.new);
});