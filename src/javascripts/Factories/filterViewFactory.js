ngapp.service('filterViewFactory', function(viewFactory, viewLinkingService) {
    this.new = function() {
        let view = viewFactory.new('filterView');

        view.destroy = function() {
            view.scope.treeView.destroy();
            view.searchOptions.nodes.forEach(node => {
                xelib.Release(node.handle);
            });
            view.results.forEach(xelib.Release);
        };

        viewLinkingService.buildFunctions(view, 'linkedFilterView', [
            'record-view'
        ]);

        return view;
    };
});

ngapp.run(function(viewFactory, filterViewFactory) {
    viewFactory.registerView('filterView', filterViewFactory.new);
});
