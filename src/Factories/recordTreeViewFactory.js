export default function(ngapp, xelib) {
    ngapp.service('recordTreeViewFactory', function() {
        let factory = this;

        this.releaseChildren = function(node) {
            node.children.forEach(function(child) {
                if (child.children) factory.releaseChildren(child);
                xelib.Release(child);
            });
        };

        this.destroy = function(view) {
            factory.releaseChildren(view.data.tree);
        };

        this.new = function() {
            return {
                name: 'recordTreeView',
                data: {
                    tabLabel: 'Record View',
                    tree: {}
                },
                destroy: factory.destroy
            }
        };
    });

    ngapp.run(function(viewFactory, recordTreeViewFactory) {
        viewFactory.registerView('recordTreeView', recordTreeViewFactory.new);
    });
};