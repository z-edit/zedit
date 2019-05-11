ngapp.run(function($rootScope, viewFactory, viewLinkingService, settingsService) {
    let newView = function() {
        let view = viewFactory.new('recordView');

        view.destroy = function() {
            let scope = view.scope;
            scope.tree && view.releaseTree(scope.tree);
            scope.virtualNodes && xelib.ReleaseNodes(scope.virtualNodes);
            this.unlinkAll();
        };

        view.releaseTree = function(tree) {
            let releaseHandle = (handle) => handle && xelib.Release(handle);
            tree.forEach((node) => node.handles.forEach(releaseHandle));
        };

        viewLinkingService.buildFunctions(view, 'linkedRecordView', [
            'tree-view', 'referenced-by-view', 'filter-view'
        ]);

        return view;
    };

    viewFactory.registerView({
        id: 'recordView',
        name: 'Record View',
        new: newView,
        isAccessible: () => $rootScope.appMode === 'edit'
    });

    settingsService.registerSettings({
        label: 'Record View',
        appModes: ['edit'],
        templateUrl: 'partials/settings/recordView.html',
        defaultSettings: {
            recordView: {
                autoExpand: false,
                showArrayIndexes: true,
                promptOnDeletion: false,
                defaultColumnWidths: { names: 250, records: 300 }
            }
        }
    });
});
