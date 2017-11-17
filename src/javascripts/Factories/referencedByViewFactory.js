ngapp.service('referencedByViewFactory', function(viewFactory) {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach((node) => xelib.Release(node.handle));
    };

    this.destroy = function() {
        let scope = this.scope;
        scope.tree && factory.releaseTree(scope.tree);
        viewFactory.unlink(this.linkedTreeView, 'linkedReferencedByView');
        viewFactory.unlink(this.linkedRecordView, 'linkedReferencedByView');
    };

    this.linkTo = function(view) {
        if (view.class === 'tree-view') {
            view.linkedReferencedByView = this;
            this.linkedTreeView = view;
        } else if (view.class === 'record-view') {
            view.linkedReferencedByView = this;
            this.linkedRecordView = view;
        }
    };

    this.new = function() {
        return viewFactory.new('referencedByView', factory);
    };
});

ngapp.run(function(viewFactory, referencedByViewFactory) {
    viewFactory.registerView('referencedByView', referencedByViewFactory.new, 'Referenced By View');
});
