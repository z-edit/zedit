ngapp.run(function(contextMenuService) {
    contextMenuService.addContextMenu('logView', [
        {
            id: 'Copy log',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Copy log',
                    callback: scope.copyLog
                });
            }
        },
        {
            id: 'Clear log',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Clear log',
                    callback: scope.clearLog
                });
            }
        }
    ]);
});
