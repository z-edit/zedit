ngapp.service('treeViewFactory', function(viewFactory, viewLinkingService) {
    this.new = function() {
        let view = viewFactory.new('treeView');

        view.releaseTree = function(tree) {
            tree.forEach((node) => {
                xelib.Release(node.handle);
                if (node.kac) xelib.Release(node.kac);
            });
        };

        view.destroy = function() {
            view.scope.tree && view.releaseTree(view.scope.tree);
            view.unlinkAll();
        };

        viewLinkingService.buildFunctions(view, 'linkedTreeView', [
            'record-view'
        ]);

        return view;
    };
});

ngapp.run(function($rootScope, viewFactory, treeViewFactory, settingsService) {
    viewFactory.registerView({
        id: 'treeView',
        name: 'Tree View',
        new: treeViewFactory.new,
        isAccessible: () => $rootScope.appMode === 'edit'
    });

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
