ngapp.run(function(contextMenuService) {
    contextMenuService.addContextMenu('checkboxList', [
        {
            id: 'Select all',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Select all',
                    hotkey: 'Ctrl+A',
                    callback: scope.selectAll
                });
            }
        }, {
            id: 'Toggle selected',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Toggle selected',
                    hotkey: 'Space',
                    callback: () => scope.toggleSelected()
                });
            }
        }, {
            id: 'Check selected',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Check selected',
                    hotkey: 'Ctrl+Space',
                    callback: () => scope.toggleSelected(true)
                });
            }
        }, {
            id: 'Uncheck selected',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Uncheck selected',
                    hotkey: 'Shift+Space',
                    callback: () => scope.toggleSelected(false)
                });
            }
        }
    ]);
});