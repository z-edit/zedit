ngapp.service('treeViewFactory', function() {
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
            templateUrl: 'partials/treeView.html',
            controller: 'treeViewController',
            class: 'tree-view',
            data: { tabLabel: 'Tree View' },
            destroy: factory.destroy
        }
    };
});

ngapp.run(function(viewFactory, treeViewFactory, settingsService) {
    viewFactory.registerView('treeView', treeViewFactory.new, 'Tree View');
    settingsService.registerSettings({
        label: 'Tree View',
        appModes: ['edit'],
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
