ngapp.run(function(contextMenuService, nodeHelpers) {
    let { divider, addContextMenu } = contextMenuService,
        { isFileNode, isRecordNode, isGroupNode,
          isEditableNode, testNodes } = nodeHelpers;

    addContextMenu('treeViewItems', [
        {
            id: 'Add',
            visible: (scope) => {
                let node = scope.selectedNodes.last();
                return node && !isRecordNode(node) && xelib.GetCanAdd(node.handle);
            },
            build: (scope, items) => {
                let node = scope.selectedNodes.last(),
                    addList = xelib.GetAddList(node.handle);
                items.push({
                    label: `Add ${isFileNode(node) ? 'group' : 'record'}`,
                    hotkey: 'Insert',
                    disabled: !addList.length,
                    children: addList.map(label => ({
                        label: label,
                        callback: () => scope.addElement(node, label)
                    }))
                });
            }
        }, {
            id: 'Add file',
            visible: (scope) => {
                return !scope.selectedNodes.length;
            },
            build: (scope, items) => {
                items.push({
                    label: 'Add file',
                    hotkey: 'Insert',
                    callback: () => scope.addFile()
                });
            }
        }, {
            id: 'Delete',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                return testNodes(scope.selectedNodes, function(node) {
                    return xelib.GetIsRemoveable(node.handle);
                });
            },
            build: (scope, items) => {
                items.push({
                    label: 'Delete',
                    hotkey: 'Del',
                    callback: () => scope.deleteElements()
                });
            }
        }, {
            id: 'Refactor',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                let nodes = scope.selectedNodes,
                    node = nodes.last();
                return isFileNode(node) && isEditableNode(node) ||
                    testNodes(nodes, function(node) {
                        return isRecordNode(node) && isEditableNode(node);
                    });
            },
            build: (scope, items) => {
                let node = scope.selectedNodes.last(),
                    typeLabel = isFileNode(node) ? 'File' : 'Records',
                    modal = `refactor${typeLabel}`;
                items.push({
                    label: `Refactor ${typeLabel.uncapitalize()}`,
                    hotkey: 'Alt+Shift+R',
                    callback: () => scope.$emit('openModal', modal, {
                        nodes: scope.selectedNodes
                    })
                });
            }
        }, {
            id: 'Save as',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                return isFileNode(scope.selectedNodes.last());
            },
            build: (scope, items) => {
                items.push({
                    label: 'Save plugin as',
                    hotkey: 'Ctrl+Alt+S',
                    callback: scope.savePluginAs
                });
            }
        }, {
            id: 'Masters',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                let nodes = scope.selectedNodes, node = nodes.last();
                return isFileNode(node) && isEditableNode(node);
            },
            build: (scope, items) => {
                let node = scope.selectedNodes.last();
                items.push({
                    label: "Masters",
                    children: [{
                        label: 'Add masters',
                        callback: () => scope.addMasters(node)
                    }, {
                        label: 'Sort masters',
                        callback: () => xelib.SortMasters(node.handle)
                    }, {
                        label: 'Clean masters',
                        callback: () => xelib.CleanMasters(node.handle)
                    }]
                });
            }
        }, {
            id: 'Enable Editing',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                return testNodes(scope.selectedNodes, function(node) {
                    return isFileNode(node) && !isEditableNode(node);
                });
            },
            build: (scope, items) => {
                items.push({
                    label: 'Enable editing',
                    hotkey: 'Ctrl+E',
                    callback: () => scope.enableEditing()
                })
            }
        }, {
            id: 'Build References',
            visible: (scope) => {
                if (!scope.selectedNodes.length) return;
                return testNodes(scope.selectedNodes, function(node) {
                    return isFileNode(node) &&
                        referenceService.canBuildReferences(node.handle);
                });
            },
            build: (scope, items) => {
                items.push({
                    label: 'Build references',
                    hotkey: 'Ctrl+B',
                    callback: () => scope.buildReferences()
                })
            }
        }, divider(), {
            id: 'Automate',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Automate',
                    hotkey: 'Ctrl+M',
                    callback: () => scope.$emit('openModal', 'automate', {
                        targetScope: scope
                    })
                })
            }
        }, {
            id: 'Advanced Search',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Advanced search',
                    hotkey: 'Ctrl+Shift+F',
                    callback: scope.openAdvancedSearchModal
                })
            }
        }, {
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
        }, divider(), {
            id: 'Copy to',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Copy into',
                    hotkey: 'Ctrl+Alt+C',
                    disabled: scope.selectedNodes.length === 0,
                    callback: () => scope.copyInto()
                })
            }
        }, {
            id: 'Copy',
            visible: (scope) => scope.selectedNodes.length > 0,
            build: (scope, items) => {
                items.push({
                    label: 'Copy',
                    hotkey: 'Ctrl+C',
                    disabled: !scope.canCopy(),
                    callback: () => scope.copyNodes()
                })
            }
        }, {
            id: 'Copy Path',
            visible: (scope) => scope.selectedNodes.length > 0,
            build: (scope, items) => {
                items.push({
                    label: 'Copy path',
                    hotkey: 'Ctrl+Shift+C',
                    disabled: !scope.selectedNodes.length,
                    callback: () => scope.copyPaths()
                })
            }
        }, {
            id: 'Paste',
            visible: (scope) => scope.selectedNodes.length > 0,
            build: (scope, items) => {
                items.push({
                    label: 'Paste',
                    hotkey: 'Ctrl+V',
                    disabled: !scope.canPaste(),
                    callback: () => scope.pasteNodes(true)
                })
            }
        }, {
            id: 'Paste as Override',
            visible: (scope) => scope.selectedNodes.length > 0,
            build: (scope, items) => {
                items.push({
                    label: 'Paste as override',
                    hotkey: 'Ctrl+Shift+V',
                    disabled: !scope.canPaste(),
                    callback: () => scope.pasteNodes()
                })
            }
        }
    ]);
});