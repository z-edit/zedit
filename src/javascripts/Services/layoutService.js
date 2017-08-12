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

    this.getDefaultLayout = function() {
        let layout = angular.copy(defaultLayout);
        service.buildPane(layout);
        return layout;
    }
});