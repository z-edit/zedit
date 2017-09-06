ngapp.service('formUtils', function ($timeout, contextMenuService) {
    this.buildShowContextMenuFunction = function(scope) {
        scope.showContextMenu = function(e) {
            let offset = { top: e.clientY, left: e.clientX},
                items = scope.contextMenuItems,
                menuItems = contextMenuService.buildMenuItems(scope, items);
            $timeout(() => scope.$emit('openContextMenu', offset, menuItems));
        };
    }
});