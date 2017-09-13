ngapp.service('contextMenuService', function($timeout) {
    let service = this;

    this.buildMenuItems = function(scope, items) {
        let menuItems = [];
        items.forEach(function(item) {
            if (!item.visible(scope, menuItems)) return;
            if (typeof item.build === 'function') {
                item.build(scope, menuItems);
            } else {
                item.build.forEach((fn) => fn(scope, menuItems));
            }
        });
        return menuItems;
    };

    this.showContextMenu = function(scope, e) {
        let offset = { top: e.clientY, left: e.clientX},
            items = scope.contextMenuItems,
            menuItems = service.buildMenuItems(scope, items);
        $timeout(() => scope.$emit('openContextMenu', offset, menuItems));
    };
});
