export default function(ngapp, fileHelpers) {
    ngapp.service('layoutService', function(viewFactory) {
        let service = this;
        let defaultLayout = fileHelpers.loadJsonFile('layouts/default.json');

        this.buildLayout = function(layout) {
            layout.forEach(function(group) {
                group.panes.forEach(function(pane) {
                    pane.tabs = pane.tabs.map(function(viewName) {
                        return viewFactory.newView(viewName);
                    });
                });
            });
        };

        this.loadDefaultLayout = function(scope) {
            scope.paneGroups = service.buildLayout(defaultLayout);
        }
    });
}