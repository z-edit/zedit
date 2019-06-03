ngapp.factory('contextMenuInterface', function(contextMenuService) {
    return function(scope, menuName) {
        let items = contextMenuService.getContextMenu(menuName);
        scope.showContextMenu = function(e) {
            let offset = { top: e.clientY, left: e.clientX},
                menuItems = service.buildMenuItems(scope, items);
            $timeout(() => scope.$emit('openContextMenu', offset, menuItems));
        };
    };
});
