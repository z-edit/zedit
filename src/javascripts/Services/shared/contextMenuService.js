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
    };
});
