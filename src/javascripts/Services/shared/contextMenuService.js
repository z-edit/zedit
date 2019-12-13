ngapp.service('contextMenuService', function($timeout, $document, htmlHelpers) {
    let contextMenus = {};

    // private helpers
    let removeTrailingDividers = function(menuItems) {
        for (let i = menuItems.length - 1; i >= 0; i--) {
            if (!menuItems[i].divider) break;
            menuItems.pop();
        }
    };

    // public api
    this.divider = () => ({
        visible: (scope, items) => items.length > 0,
        build: (scope, items) => items.push({ divider: true })
    });

    this.buildMenuItems = function(scope, items) {
        let menuItems = [];
        items.forEach(item => {
            if (!item.visible(scope, menuItems)) return;
            item.build(scope, menuItems);
        });
        removeTrailingDividers(menuItems);
        return menuItems;
    };

    this.addContextMenu = function(name, items) {
        contextMenus[name] = items;
    };

    this.getContextMenu = function(menuName) {
        return contextMenus[menuName];
    };
});
