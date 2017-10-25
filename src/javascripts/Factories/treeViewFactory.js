ngapp.service('treeViewFactory', function(viewFactory) {
    let factory = this;

    this.releaseTree = function(tree) {
        tree.forEach((node) => xelib.Release(node.handle));
    };

    this.destroy = function(view) {
        let tree = view.data.tree;
        tree && factory.releaseTree(tree);
        if (view.linkedRecordView) {
            delete view.linkedRecordView.linkedTreeView;
        }
    };

    this.isLinkedTo = function(view) {
        return view.linkedTreeView === this;
    };

    this.canLinkTo = function(view) {
        return view.class === 'record-view' && !this.linkedRecordView;
    };

    this.linkTo = function(view) {
        if (view.class === 'record-view') {
            view.linkedTreeView = this;
            this.linkedRecordView = view;
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
