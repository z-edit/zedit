ngapp.service('recordTreeViewFactory', function() {
    let factory = this;

    this.releaseChildren = function(node) {
        node.children.forEach(function(child) {
            if (child.children) factory.releaseChildren(child);
            xelib.Release(child.handle);
        });
    };

    this.destroy = function(view) {
        factory.releaseChildren(view.data.tree);
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