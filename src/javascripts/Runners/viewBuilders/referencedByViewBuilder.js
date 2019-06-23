ngapp.run(function($rootScope, viewFactory, viewLinkingInterface) {
    let newView = function() {
        let view = viewFactory.new('referencedByView');

        view.releaseGrid = function(grid) {
            grid.forEach((node) => xelib.Release(node.handle));
        };

        view.destroy = function() {
            view.scope.grid && view.releaseGrid(view.scope.grid);
        };

        viewLinkingInterface(view, 'linkedReferencedByView', [
            'record-view'
        ]);

        return view;
    };

    viewFactory.registerView({
        id: 'referencedByView',
        name: 'Referenced By View',
        new: newView,
        isAccessible: () => $rootScope.appMode.id === 'edit'
    });
});
