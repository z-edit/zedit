ngapp.service('contextMenuService', function($timeout, $document, htmlHelpers) {
    let service = this;

    this.buildMenuItems = function(scope, items) {
        let menuItems = [];
        items.forEach(item => {
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

    this.init = function(scope) {
        // event handlers
        scope.$on('openContextMenu', function(e, offset, items) {
            if (!items.length) return;
            $timeout(() => {
                scope.showContextMenu = true;
                scope.contextMenuOffset = offset;
                let buildTemplateUrl = function(item) {
                    item.templateUrl = `directives/contextMenu${item.divider ? 'Divider' : 'Item'}.html`;
                    if (item.children) item.children.forEach(buildTemplateUrl);
                };
                items.forEach(buildTemplateUrl);
                scope.contextMenuItems = items;
            });
        });

        scope.$on('closeContextMenu', function(e) {
            scope.showContextMenu = false;
            e.stopPropagation();
        });

        // hide context menu when user clicks in document
        $document.bind('mousedown', function(e) {
            if (!scope.showContextMenu) return;
            let parentMenu = htmlHelpers.findParent(e.srcElement, function(element) {
                return element.tagName === 'CONTEXT-MENU';
            });
            if (parentMenu) return;
            scope.$applyAsync(() => scope.showContextMenu = false);
        });

        // hide context menu when window loses focus
        window.onblur = () => scope.$applyAsync(() => scope.showContextMenu = false);
    }
});
