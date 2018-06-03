ngapp.service('contextMenuFactory', function(referenceService, nodeHelpers, editModalFactory) {
    let uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray, xelib.vtStruct];

    // helper functions
    let isFileNode = nodeHelpers.isFileNode;
    let isRecordNode = nodeHelpers.isRecordNode;
    let isGroupNode = nodeHelpers.isGroupNode;
    let isEditableNode = nodeHelpers.isEditableNode;

    let divider = {
        visible: (scope, items) => {
            return items.length > 0 && !items.last().divider;
        },
        build: (scope, items) => items.push({ divider: true })
    };

    let testNodes = function(nodes, testFn) {
        return nodes.reduce(function (b, node) {
            return b && testFn(node);
        }, true);
    };

    // public api
    this.checkboxListItems = [{
        id: 'Select All',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Select All',
                hotkey: 'Ctrl+A',
                callback: scope.selectAll
            });
        }
    }, {
        id: 'Toggle selected',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Toggle selected',
                hotkey: 'Space',
                callback: () => scope.toggleSelected()
            });
        }
    }, {
        id: 'Check Selected',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Check Selected',
                hotkey: 'Ctrl+Space',
                callback: () => scope.toggleSelected(true)
            });
        }
    }, {
        id: 'Uncheck Selected',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Uncheck Selected',
                hotkey: 'Shift+Space',
                callback: () => scope.toggleSelected(false)
            });
        }
    }];

    this.treeViewItems = [{
        id: 'Add',
        visible: (scope) => {
            let node = scope.selectedNodes.last();
            return node && !isRecordNode(node) && xelib.GetCanAdd(node.handle);
        },
        build: (scope, items) => {
            let node = scope.selectedNodes.last(),
                addList = xelib.GetAddList(node.handle);
            items.push({
                label: `Add ${isFileNode(node) ? 'Group' : 'Record'}`,
                hotkey: 'Insert',
                disabled: !addList.length,
                children: addList.map(function(label) {
                    return {
                        label: label,
                        callback: () => scope.addElement(node, label)
                    };
                })
            });
        }
    }, {
        id: 'Add File',
        visible: (scope) => {
            return !scope.selectedNodes.length;
        },
        build: (scope, items) => {
            items.push({
                label: 'Add File',
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
                label: `Refactor ${typeLabel}`,
                hotkey: 'Alt+Shift+R',
                callback: () => scope.$emit('openModal', modal, {
                    nodes: scope.selectedNodes
                })
            });
        }
    }, {
        id: 'Save Plugin As',
        visible: (scope) => {
            if (!scope.selectedNodes.length) return;
            return isFileNode(scope.selectedNodes.last());
        },
        build: (scope, items) => {
            items.push({
                label: 'Save Plugin As',
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
                    label: 'Add Masters',
                    callback: () => scope.addMasters(node)
                }, {
                    label: 'Sort Masters',
                    callback: () => xelib.SortMasters(node.handle)
                }, {
                    label: 'Clean Masters',
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
                label: 'Enable Editing',
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
                label: 'Build References',
                hotkey: 'Ctrl+B',
                callback: () => scope.buildReferences()
            })
        }
    }, divider, {
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
                label: 'Advanced Search',
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
                label: 'Open in Record View',
                hotkey: 'Enter',
                callback: () => scope.open(node)
            })
        }
    }, divider, {
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
    },{
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
                label: 'Copy Path',
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
                label: 'Paste as Override',
                hotkey: 'Ctrl+Shift+V',
                disabled: !scope.canPaste(),
                callback: () => scope.pasteNodes()
            })
        }
    }];

    this.recordViewItems = [{
        id: 'Add',
        visible: (scope) => {
            if (!scope.selectedNodes.length) return;
            let node = scope.selectedNodes.last(),
                index = scope.focusedIndex - 1,
                handle = node.handles[index],
                record = index ? scope.overrides[index - 1] : scope.record,
                parentAvailable = !node.depth || (node.parent && node.parent.handles[index]);
            if (!xelib.GetIsEditable(record)) return false;
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
            if (!xelib.GetIsEditable(record)) return false;
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
    }, divider, {
        id: 'Toggle unassigned',
        visible: () => true,
        build: (scope, items) => {
            let hidden = scope.hideUnassigned;
            items.push({
                label: `${hidden ? 'Show' : 'Hide'} unassigned fields`,
                hotkey: '', //TODO
                callback: () => scope.hideUnassigned = !hidden
            })
        }
    }, divider, {
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
                label: 'Copy Path',
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
    }];

    this.referencedByViewItems = [{
        id: 'Open',
        visible: (scope) => {
            let node = scope.selectedNodes.last();
            return node && !isGroupNode(node);
        },
        build: (scope, items) => {
            let node = scope.selectedNodes.last();
            items.push({
                label: 'Open in Record View',
                hotkey: 'Enter',
                callback: () => scope.open(node)
            })
        }
    }]
});
