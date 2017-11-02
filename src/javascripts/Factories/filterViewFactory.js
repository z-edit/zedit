ngapp.service('filterViewFactory', function(viewFactory) {
    let factory = this;

    this.destroy = function() {
        this.scope.treeView.destroy();
    };

    this.isLinkedTo = function(view) {
        return view.linkedFilterView === this;
    };

    this.canLinkTo = function(view) {
        return view.class === 'record-view' && !this.linkedRecordView;
    };

    this.linkTo = function(view) {
        if (view.class === 'record-view') {
            view.linkedFilterView = this;
            this.linkedRecordView = view;
        }
    };

    this.new = function() {
        return viewFactory.new('filterView', factory);
    };
});

ngapp.run(function(viewFactory, filterViewFactory) {
    viewFactory.registerView('filterView', filterViewFactory.new);
});
