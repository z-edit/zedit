ngapp.factory('contextMenuInterface', function($timeout, contextMenuService) {
    let {getContextMenu, buildMenuItems} = contextMenuService;

    return function(scope, menuName) {
        let items = getContextMenu(menuName);
        scope.showContextMenu = function(e) {
            let offset = { top: e.clientY, left: e.clientX},
                menuItems = buildMenuItems(scope, items);
            $timeout(() => scope.$emit('openContextMenu', offset, menuItems));
        };
    };
});
