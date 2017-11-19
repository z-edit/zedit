ngapp.service('referencedByViewFactory', function(viewFactory) {
    let factory = this;

    this.releaseGrid = function(grid) {
        grid.forEach((node) => xelib.Release(node.handle));
    };

    this.destroy = function() {
        let scope = this.scope;
        scope.grid && factory.releaseGrid(scope.grid);
    };

    this.new = function() {
        return viewFactory.new('referencedByView', factory);
    };
});

ngapp.run(function(viewFactory, referencedByViewFactory) {
    viewFactory.registerView('referencedByView', referencedByViewFactory.new, 'Referenced By View');
});
