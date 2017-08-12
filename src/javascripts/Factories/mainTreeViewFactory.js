ngapp.service('mainTreeViewFactory', function() {
    let factory = this;

    this.destroy = function(view) {
        view.data.tree.forEach((node) => xelib.Release(node.handle));
    };

    this.new = function() {
        return {
            templateUrl: 'partials/mainTreeView.html',
            controller: mainTreeViewController,
            class: 'main-tree-view',
            data: {
                tabLabel: 'Tree View',
                tree: {}
            },
            destroy: factory.destroy
        }
    };
});

ngapp.run(function(viewFactory, mainTreeViewFactory) {
    viewFactory.registerView('mainTreeView', mainTreeViewFactory.new);
});