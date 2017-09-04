ngapp.service('newTabViewFactory', function($controller) {
    this.new = function() {
        return {
            templateUrl: 'partials/newTabView.html',
            controller: $controller('newTabViewController'),
            class: 'new-tab-view',
            data: { tabLabel: 'New Tab' },
            destroy: () => {}
        }
    };
});

ngapp.run(function(viewFactory, newTabViewFactory) {
    viewFactory.registerView('newTabView', newTabViewFactory.new);
});