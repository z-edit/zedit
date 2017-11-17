ngapp.service('treeViewFactory', function(viewFactory) {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach((node) => {
            xelib.Release(node.handle);
            if (node.kac) xelib.Release(node.kac);
        });
    };

    this.destroy = function() {
        let scope = this.scope;
        scope.tree && factory.releaseTree(scope.tree);
        viewFactory.unlink(this.linkedRecordView, 'linkedTreeView');
        viewFactory.unlink(this.linkedReferencedByView, 'linkedTreeView');
    };

    this.isLinkedTo = function(view) {
        return view.linkedTreeView === this;
    };

    this.canLinkTo = function(view) {
        return ((view.class === 'record-view' && !this.linkedRecordView) || (view.class === 'referenced-by-view' && !this.linkedReferencedByView));
    };

    this.linkTo = function(view) {
        if (view.class === 'record-view') {
            view.linkedTreeView = this;
            this.linkedRecordView = view;
        } else if (view.class === 'referenced-by-view') {
            view.linkedTreeView = this;
            this.linkedReferencedByView = view;
        }
    };

    this.new = function() {
        return viewFactory.new('treeView', factory);
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
