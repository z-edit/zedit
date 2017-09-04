ngapp.service('recordTreeViewFactory', function($controller) {
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
            templateUrl: 'partials/recordTreeView.html',
            controller: $controller('recordTreeViewController'),
            class: 'record-tree-view',
            data: { tabLabel: 'Record View' },
            destroy: factory.destroy
        }
    };
});

ngapp.run(function(viewFactory, recordTreeViewFactory, settingsService) {
    viewFactory.registerView('recordTreeView', recordTreeViewFactory.new, 'Record View');
    settingsService.registerSettings({
        label: 'Record View',
        templateUrl: 'partials/settings/recordView.html',
        controller: () => {},
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