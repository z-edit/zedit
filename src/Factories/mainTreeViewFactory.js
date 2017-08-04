export default function(ngapp, xelib) {
    ngapp.service('mainTreeViewFactory', function(viewFactory) {
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
                name: 'mainTreeView',
                data: {
                    tabLabel: 'Tree View',
                    tree: {}
                },
                destroy: factory.destroy
            }
        };

        // register view
        viewFactory.registerView('mainTreeView', factory.new);
    });
};