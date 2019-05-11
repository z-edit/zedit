ngapp.run(function(contextMenuService, nodeHelpers) {
    let { divider } = contextMenuService,
        { isRecordNode, isGroupNode, isTopGroupNode } = nodeHelpers;

    contextMenuService.addContextMenu('smashTreeView', [
        {
            id: 'Exclude from patch',
            visible: (scope) => {
                let node = scope.selectedNodes.last();
                return node && isTopGroupNode(node) || isRecordNode(node);
            },
            build: (scope, items) => {
                items.push({
                    label: 'Exclude from patch',
                    hotkey: 'Delete',
                    callback: () => scope.excludeNodes()
                });
            }
        }, {
            id: 'Manage exclusions',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Manage exclusions',
                    hotkey: 'Ctrl+M',
                    callback: scope.manageExclusions
                });
            }
        }, divider(), {
            id: 'Regenerate patch',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Regenerate patch',
                    hotkey: 'Ctrl+R',
                    callback: scope.regeneratePatch
                });
            }
        }, {
            id: 'Toggle ITPOs',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: scope.showITPOs ? 'Hide ITPOs' : 'Show ITPOs',
                    hotkey: '', // TODO
                    callback: scope.toggleITPOs
                })
            }
        }, divider(), {
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
                });
            }
        }, {
            id: 'Open in new',
            visible: (scope) => {
                let node = scope.selectedNodes.last();
                return node && !isGroupNode(node);
            },
            build: (scope, items) => {
                let node = scope.selectedNodes.last();
                items.push({
                    label: 'Open in new record view',
                    hotkey: 'Ctrl+Enter',
                    callback: () => scope.open(node, true)
                })
            }
        }
    ]);
});