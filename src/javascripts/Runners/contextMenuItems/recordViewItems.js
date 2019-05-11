ngapp.run(function(contextMenuService) {
    let { divider, addContextMenu } = contextMenuService,
        { testNodes } = nodeHelpers,
        uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray, xelib.vtStruct];

    addContextMenu('recordViewItems', [
        {
            id: 'Add',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                let node = scope.selectedNodes.last(),
                    index = scope.focusedIndex - 1,
                    handle = node.handles[index],
                    record = index ? scope.overrides[index - 1] : scope.record,
                    parentAvailable = !node.depth || (node.parent && node.parent.handles[index]);
                if (!record || !xelib.GetIsEditable(record)) return;
                return parentAvailable && (handle === 0 || node.value_type === xelib.vtArray);
            },
            build: (scope, items) => {
                let node = scope.selectedNodes.last(),
                    index = scope.focusedIndex - 1;
                items.push({
                    label: 'Add',
                    hotkey: 'Insert',
                    callback: () => scope.addElement(node, index)
                });
            }
        }, {
            id: 'Edit',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                let node = scope.selectedNodes.last(),
                    index = scope.focusedIndex - 1,
                    handle = node.handles[index],
                    record = index === 0 ? scope.record : scope.overrides[index - 1];
                if (!record || !xelib.GetIsEditable(record)) return;
                return handle !== 0 && !uneditableValueTypes.includes(node.value_type);
            },
            build: (scope, items) => {
                let node = scope.selectedNodes.last(),
                    index = scope.focusedIndex;
                items.push({
                    label: 'Edit',
                    hotkey: 'Enter',
                    callback: () => scope.editElement(node, index)
                });
            }
        }, {
            id: 'Delete',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                let index = scope.focusedIndex - 1;
                return testNodes(scope.selectedNodes, function(node) {
                    let handle = node.handles[index];
                    return handle && xelib.GetIsRemoveable(handle);
                });
            },
            build: (scope, items) => {
                items.push({
                    label: 'Delete',
                    hotkey: 'Del',
                    callback: () => scope.deleteElements()
                });
            }
        }, divider(), {
            id: 'Toggle unassigned',
            visible: () => true,
            build: (scope, items) => {
                let hidden = scope.hideUnassigned;
                items.push({
                    label: `${hidden ? 'Show' : 'Hide'} unassigned fields`,
                    hotkey: '', //TODO
                    callback: () => scope.hideUnassigned = !hidden
                });
            }
        }, {
            id: 'Toggle conflicting',
            visible: () => true,
            build: (scope, items) => {
                let hidden = scope.hideNonConflicting;
                items.push({
                    label: `${hidden ? 'Show' : 'Hide'} non-conflicting rows`,
                    hotkey: '', //TODO
                    callback: () => scope.hideNonConflicting = !hidden
                });
            }
        }, divider(), {
            id: 'Copy',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Copy',
                    hotkey: 'Ctrl+C',
                    disabled: !scope.canCopy(),
                    callback: () => scope.copyNodes()
                });
            }
        }, {
            id: 'Copy Path',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Copy path',
                    hotkey: 'Ctrl+Shift+C',
                    disabled: !scope.selectedNodes.length,
                    callback: () => scope.copyPaths()
                });
            }
        }, {
            id: 'Paste',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Paste',
                    hotkey: 'Ctrl+V',
                    disabled: !scope.canPaste(),
                    callback: () => scope.pasteNodes()
                });
            }
        }, {
            id: 'Paste into record',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Paste into record',
                    hotkey: 'Ctrl+Shift+V',
                    disabled: !scope.canPaste(true),
                    callback: () => scope.pasteNodes(true)
                });
            }
        }
    ]);
});