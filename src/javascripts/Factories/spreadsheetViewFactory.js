ngapp.service('spreadsheetViewFactory', function(viewFactory, viewLinkingService) {
    this.new = function() {
        let view = viewFactory.new('spreadsheetView');

        view.releaseNodes = function(nodes) {
            nodes.forEach(node => xelib.Release(node.handle));
        };

        view.destroy = function() {
            view.scope.nodes && view.releaseNodes(view.scope.nodes);
            view.unlinkAll();
        };

        viewLinkingService.buildFunctions(view, 'linkedSpreadsheetView', [
            'record-view'
        ]);

        return view;
    };
});

ngapp.run(function(viewFactory, spreadsheetViewFactory, settingsService) {
    let newView = spreadsheetViewFactory.new;
    viewFactory.registerView('spreadsheetView', newView, 'Spreadsheet View');
    settingsService.registerSettings({
        label: 'Spreadsheet View',
        appModes: ['edit'],
        templateUrl: 'partials/settings/spreadsheetView.html',
        defaultSettings: {}
    });
});
