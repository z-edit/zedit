ngapp.run(function($rootScope, viewFactory, viewLinkingService) {
    let newView = function() {
        let view = viewFactory.new('smashTreeView', {
            templateUrl: `partails/treeView.html`
        });

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

        viewLinkingService.buildFunctions(view, 'linkedSmashTreeView', [
            'smash-record-view'
        ]);

        return view;
    };

    viewFactory.registerView({
        id: 'smashTreeView',
        new: newView,
        name: 'Smash Tree View',
        isAccessible: () => $rootScope.appMode === 'smash'
    });
});
