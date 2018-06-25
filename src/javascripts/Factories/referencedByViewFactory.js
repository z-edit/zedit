ngapp.service('referencedByViewFactory', function(viewFactory, viewLinkingService) {
    this.new = function() {
        let view = viewFactory.new('referencedByView');

        view.releaseGrid = function(grid) {
            grid.forEach((node) => xelib.Release(node.handle));
        };

        view.destroy = function() {
            view.scope.grid && view.releaseGrid(view.scope.grid);
        };

        viewLinkingService.buildFunctions(view, 'linkedReferencedByView', [
            'record-view'
        ]);

        return view;
    };
});

ngapp.run(function(viewFactory, referencedByViewFactory) {
    viewFactory.registerView('referencedByView', referencedByViewFactory.new,
        'Referenced By View');
});
