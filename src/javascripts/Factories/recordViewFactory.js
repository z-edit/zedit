ngapp.service('recordViewFactory', function() {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach(function(node) {
            node.handles.forEach((handle) => handle && xelib.Release(handle));
        });
    };

    this.destroy = function(view) {
        let virtualNodes = view.data.scope.virtualNodes,
            tree = view.data.tree;
        tree && factory.releaseTree(tree);
        virtualNodes && xelib.ReleaseNodes(virtualNodes);
    };

    this.new = function() {
        return {
            templateUrl: 'partials/recordView.html',
            controller: 'recordViewController',
            class: 'record-view',
            data: { tabLabel: 'Record View' },
            destroy: factory.destroy
        }
    };
});

ngapp.run(function(viewFactory, recordViewFactory, settingsService) {
    viewFactory.registerView('recordView', recordViewFactory.new, 'Record View');
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
