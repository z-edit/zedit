ngapp.factory('rootContextMenuInterface', function($document, $timeout, htmlHelpers) {
    let buildTemplateUrl = function(item) {
        let templateName = `contextMenu${item.divider ? 'Divider' : 'Item'}`;
        item.templateUrl = `directives/${templateName}.html`;
        if (item.children) item.children.forEach(buildTemplateUrl);
    };

    let isContextMenuElement = element => element.tagName === 'CONTEXT-MENU';

    return function(scope) {
        // event handlers
        scope.$on('openContextMenu', function(e, offset, items) {
            if (!items.length) return;
            $timeout(() => {
                scope.showContextMenu = true;
                scope.contextMenuOffset = offset;
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
            let parentMenu = htmlHelpers.findParent(
                e.srcElement, isContextMenuElement
            );
            if (parentMenu) return;
            scope.$applyAsync(() => scope.showContextMenu = false);
        });

        // hide context menu when window loses focus
        window.onblur = () => scope.$applyAsync(() => {
            scope.showContextMenu = false;
        });
    };
});
