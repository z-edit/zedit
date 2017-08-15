ngapp.service('layoutService', function(viewFactory) {
    let service = this;
    let defaultLayout = fileHelpers.loadJsonFile('layouts/default.json');

    this.buildPane = function(pane) {
        if (pane.panes) pane.panes.forEach(service.buildPane);
        if (pane.tabs) {
            pane.tabs = pane.tabs.map(viewFactory.newView);
            pane.tabs[0].active = true;
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