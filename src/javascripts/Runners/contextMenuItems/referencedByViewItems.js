ngapp.run(function(contextMenuService, nodeHelpers) {
    let { addContextMenu } = contextMenuService,
        { isGroupNode } = nodeHelpers;

    addContextMenu('referencedByViewItems', [
        {
            id: 'Open',
            visible: (scope) => {
                let node = scope.selectedNodes.last();
                return node && !isGroupNode(node);
            },
            build: (scope, items) => {
                let node = scope.selectedNodes.last();
                items.push({
                    label: 'Open in record view',
                    hotkey: 'Enter',
                    callback: () => scope.open(node)
                })
            }
        }
    ]);
});