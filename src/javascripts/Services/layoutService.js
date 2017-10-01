ngapp.service('layoutService', function(viewFactory, randomService) {
    let service = this,
        defaultLayout = {
            "layout": "horizontal",
            "panes": [{
                "width": "45%",
                "tabs": ["mainTreeView"]
            }, {
                "tabs": ["recordTreeView"]
            }]
        };
    // TODO: load from disk instead
    //defaultLayout = fh.loadJsonFile('layouts/default.json');

    this.buildPane = function(pane) {
        pane.id = randomService.generateUniqueId();
        if (pane.panes) pane.panes.forEach(service.buildPane);
        if (pane.tabs) {
            pane.tabs = pane.tabs.map(function(viewName, index) {
                return viewFactory.newView(viewName, index === 0);
            });
        }
    };

    this.buildDefaultLayout = function() {
        service.layout = angular.copy(defaultLayout);
        service.buildPane(service.layout);
        return service.layout;
    };

    this.findView = function(callback) {
        let view = undefined,
            findPane = function(pane) {
                for (let i = 0; i < pane.tabs.length; i++) {
                    if (callback(pane.tabs[i])) {
                        view = pane.tabs[i];
                        return true;
                    }
                }
                return pane.panes.find(findPane);
            };
        service.layout.panes.find(findPane);
        return view;
    };
});
