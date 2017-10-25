ngapp.service('recordViewFactory', function(viewFactory) {
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
        if (view.linkedTreeView) {
            delete view.linkedTreeView.linkedRecordView;
        }
    };

    this.isLinkedTo = () => {};

    this.canLinkTo = () => {};

    this.linkTo = function(view) {
        if (view.class === 'tree-view') {
            view.linkedRecordView = this;
            this.linkedTreeView = view;
        }
    };

    this.new = function() {
        return viewFactory.new('recordView', factory);
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
