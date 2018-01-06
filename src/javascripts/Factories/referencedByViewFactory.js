ngapp.service('referencedByViewFactory', function(viewFactory) {
    let factory = this;

    this.releaseGrid = function(grid) {
        grid.forEach((node) => xelib.Release(node.handle));
    };

    this.destroy = function() {
        let scope = this.scope;
        scope.grid && factory.releaseGrid(scope.grid);
    };

    this.isLinkedTo = function(view) {
        return view.linkedReferencedByView === this;
    };

    this.canLinkTo = function(view) {
        return view.class === 'record-view' && !this.linkedRecordView;
    };

    this.linkTo = function(view) {
        if (view.class === 'record-view') {
            view.linkedReferencedByView = this;
            this.linkedRecordView = view;
        }
    };

    this.new = function() {
        return viewFactory.new('referencedByView', factory);
    };
});

ngapp.run(function(viewFactory, referencedByViewFactory) {
    viewFactory.registerView('referencedByView', referencedByViewFactory.new, 'Referenced By View');
});
