ngapp.service('mainTreeViewFactory', function() {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach((node) => xelib.Release(node.handle));
    };

    this.destroy = function(view) {
        factory.releaseTree(view.data.tree);
    };

    this.new = function() {
        return {
            templateUrl: 'partials/mainTreeView.html',
            controller: mainTreeViewController,
            class: 'main-tree-view',
            data: {
                tabLabel: 'Tree View'
            },
            destroy: factory.destroy
        }
    };
});

ngapp.run(function(viewFactory, mainTreeViewFactory) {
    viewFactory.registerView('mainTreeView', mainTreeViewFactory.new);
});