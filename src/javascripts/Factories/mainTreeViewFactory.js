ngapp.service('mainTreeViewFactory', function() {
    let factory = this;

    this.destroy = function(view) {
        let dataScope = view.data.scope;
        dataScope.tree.forEach((node) => xelib.Release(node.handle));
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