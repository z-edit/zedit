ngapp.service('recordTreeViewFactory', function() {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach(function(node) {
            node.handles.forEach((handle) => handle && xelib.Release(handle));
        });
    };

    this.destroy = function(view) {
        factory.releaseTree(view.data.tree);
        let virtualNodes = view.data.scope.virtualNodes;
        virtualNodes && xelib.ReleaseNodes(virtualNodes);
    };

    this.new = function() {
        return {
            templateUrl: 'partials/recordTreeView.html',
            controller: recordTreeViewController,
            class: 'record-tree-view',
            data: {
                tabLabel: 'Record View',
                tree: {}
            },
            destroy: factory.destroy
        }
    };
});

ngapp.run(function(viewFactory, recordTreeViewFactory) {
    viewFactory.registerView('recordTreeView', recordTreeViewFactory.new);
});