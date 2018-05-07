ngapp.service('layoutService', function(viewFactory, randomService) {
    let service = this,
        defaultLayout = {
            "layout": "horizontal",
            "panes": [{
                "width": "45%",
                "tabs": ["treeView"]
            }, {
                "tabs": ["recordView", "referencedByView", "logView"]
            }]
        };
    // TODO: load from disk instead
    //defaultLayout = fh.loadJsonFile('layouts/default.json');

    this.buildPane = function(pane) {
        pane.id = randomService.generateUniqueId();
        if (pane.panes) pane.panes.forEach(service.buildPane);
        if (!pane.tabs) return;
        pane.tabs = pane.tabs.map(function(viewName, index) {
            let view = viewFactory.newView(viewName, index === 0);
            view.pane = pane;
            return view;
        });
    };

    this.buildDefaultLayout = function() {
        if (verbose) logger.info('buildDefaultLayout()');
        service.layout = angular.copy(defaultLayout);
        service.buildPane(service.layout);
        if (verbose) logger.info(`built ${service.layout.panes.length} panes`);
        return service.layout;
    };

    this.findView = function(callback) {
        return service.layout.panes.findNested('tabs', 'panes', callback);
    };

    this.switchToView = function(viewClass) {
        let view = service.findView(tab => tab.class === viewClass);
        if (!view) return;
        view.pane.tabs.forEach(tab => tab.active = tab === view);
    };
});
