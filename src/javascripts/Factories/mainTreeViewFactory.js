ngapp.service('mainTreeViewFactory', function() {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach((node) => xelib.Release(node.handle));
    };

    this.destroy = function(view) {
        let tree = view.data.tree;
        tree && factory.releaseTree(tree);
    };

    this.new = function() {
        return {
            templateUrl: 'partials/mainTreeView.html',
            controller: mainTreeViewController,
            class: 'main-tree-view',
            data: { tabLabel: 'Tree View' },
            destroy: factory.destroy
        }
    };
});

ngapp.run(function(viewFactory, mainTreeViewFactory, settingsService) {
    viewFactory.registerView('mainTreeView', mainTreeViewFactory.new, 'Tree View');
    settingsService.registerSettings({
        label: 'Tree View',
        templateUrl: 'partials/settings/treeView.html',
        defaultSettings: {
            treeView: {
                showGroupSignatures: false,
                promptOnDeletion: true,
                showFileHeaders: false
            }
        }
    });
});