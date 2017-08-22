ngapp.service('contextMenuService', function() {
    this.buildNodeMenuItems = function(node, scope, items) {
        let menuItems = [];
        items.forEach(function(item) {
            item.available(menuItems, node, scope) && item.build(menuItems, node, scope);
        });
        return menuItems;
    };
});