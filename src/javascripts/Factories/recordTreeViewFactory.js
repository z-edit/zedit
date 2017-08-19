ngapp.service('recordTreeViewFactory', function() {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach((node) => xelib.Release(node.handle));
    };

    this.destroy = function(view) {
        factory.releaseTree(view.data.tree);
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