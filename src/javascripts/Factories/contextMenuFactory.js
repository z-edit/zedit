ngapp.service('contextMenuFactory', function() {
    let uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray, xelib.vtStruct];

    let divider = {
        visible: (scope, items) => { return items.length > 0 && !items.last().divider; },
        build: (scope, items) => items.push({ divider: true })
    };

    let testNodes = function(nodes, testFn) {
        return nodes.reduce(function (b, node) {
            return b && testFn(node);
        }, true);
    };

    this.mainTreeItems = [{
        id: 'Add',
        visible: (scope) => {
            let node = scope.selectedNodes.last();
            return node.element_type !== xelib.etMainRecord && xelib.GetCanAdd(node.handle);
        },
        build: (scope, items) => {
            let node = scope.selectedNodes.last(),
                addList = xelib.GetAddList(node.handle),
                isFile = node.element_type === xelib.etFile;
            items.push({
                label: `Add ${isFile ? 'Group' : 'Record'}`,
                hotkey: isFile ? 'Ctrl+G' : (addList.length == 1 && 'Ctrl+N'),
                disabled: !addList.length,
                children: addList.map(function(item) {
                    return {
                        label: item,
                        callback: () => scope.addElement(node, item)
                    };
                })
            });
        }
    }, {
        id: 'Delete',
        visible: (scope) => {
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
            let nodes = scope.selectedNodes, node = nodes.last();
            return node.element_type === xelib.etFile && xelib.GetIsEditable(node.handle) ||
                testNodes(nodes, function(node) {
                    return node.element_type === xelib.etMainRecord && xelib.GetIsEditable(node.handle);
                });
        },
        build: (scope, items) => {
            let node = scope.selectedNodes.last(),
                children = [];
            if (node.element_type === xelib.etFile) {
                children.push({
                    label: 'Rename File',
                    hotkey: 'F2, Alt+Shift+R',
                    callback: () => scope.changeFileName(node)
                }, {
                    label: 'Change Author',
                    hotkey: 'Alt+Shift+A',
                    callback: () => scope.changeFileAuthor(node)
                }, {
                    label: 'Change Description',
                    hotkey: 'Alt+Shift+D',
                    callback: () => scope.changeFileDescription(node)
                });
            } else if (node.element_type === xelib.etMainRecord) {
                children.push({
                    label: 'Rename',
                    hotkey: 'F2, Alt+Shift+R',
                    callback: () => scope.toggleRefactorModal(true, 'Name')
                }, {
                    label: 'Change EditorIDs',
                    hotkey: 'Alt+Shift+E',
                    callback: () => scope.toggleRefactorModal(true, 'EditorID')
                }, {
                    label: 'Change FormIDs',
                    hotkey: 'Alt+Shift+F',
                    callback: () => scope.toggleRefactorModal(true, 'FormID')
                });
            }
            items.push({
                label: 'Refactor',
                children: children
            });
        }
    }, {
        id: 'Enable Editing',
        visible: (scope) => {
            return testNodes(scope.selectedNodes, function(node) {
                return node.element_type === xelib.etFile && !xelib.GetIsEditable(node.handle);
            });
        },
        build: (scope, items) => {
            items.push({
                label: 'Enable Editing',
                hotkey: 'Ctrl+E',
                callback: () => scope.enableEditing(node)
            })
        }
    }, divider, {
        id: 'Automate',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Automate',
                hotkey: 'Ctrl+M',
                callback: () => scope.toggleAutomateModal()
            })
        }
    }, {
        id: 'Advanced Search',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Advanced Search',
                hotkey: 'Ctrl+Shift+F',
                callback: () => scope.toggleSearchModal()
            })
        }
    }, {
        id: 'Open',
        visible: (scope) => {
            return testNodes(scope.selectedNodes, function(node) {
                return node.element_type === xelib.etMainRecord;
            });
        },
        build: (scope, items) => {
            items.push({
                label: 'Open in Record View',
                hotkey: 'Enter',
                callback: () => scope.onNodeDoubleClick({}, node)
            })
        }
    }, divider, {
        id: 'Copy',
        visible: () => { return true; },
        build: (scope, items) => {
            let node = scope.selectedNodes.last();
            items.push({
                label: 'Copy',
                hotkey: 'Ctrl+C',
                disabled: !node,
                callback: () => scope.copyNodes()
            })
        }
    }, {
        id: 'Copy Path',
        visible: () => { return true; },
        build: (scope, items) => {
            let node = scope.selectedNodes.last();
            items.push({
                label: 'Copy Path',
                hotkey: 'Ctrl+Shift+C',
                disabled: !node,
                callback: () => scope.copyNodePaths()
            })
        }
    }, {
        id: 'Paste',
        visible: () => { return true },
        build: (scope, items) => {
            items.push({
                label: 'Paste',
                hotkey: 'Ctrl+V',
                disabled: !scope.canPaste(),
                callback: () => scope.paste()
            })
        }
    }, {
        id: 'Paste as Override',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Paste as Override',
                hotkey: 'Ctrl+Shift+V',
                disabled: !scope.canPaste(true),
                callback: () => scope.paste(true)
            })
        }
    }];

    this.recordTreeItems = [{
        id: 'Add',
        visible: (scope) => {
            let node = scope.selectedNodes.last(),
                index = scope.focusedIndex - 1,
                handle = node.handles[index],
                record = index ? scope.overrides[index - 1] : scope.record,
                parentAvailable = !node.parent || node.parent.handles[index];
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
            let node = scope.selectedNodes.last(),
                index = scope.focusedIndex - 1,
                handle = node.handles[index],
                record = index === 0 ? scope.record : scope.overrides[index - 1];
            if (!xelib.GetIsEditable(record)) return false;
            return handle !== 0 && !uneditableValueTypes.contains(node.value_type);
        },
        build: (scope, items) => {
            let node = scope.selectedNodes.last(),
                index = scope.focusedIndex - 1;
            items.push({
                label: 'Add',
                hotkey: 'Insert',
                callback: () => scope.editElement(node, index)
            });
        }
    }, {
        id: 'Delete',
        visible: (scope) => {
            let index = scope.focusedIndex - 1;
            return testNodes(scope.selectedNodes, function(node) {
                return xelib.GetIsRemoveable(node.handles[index]);
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
        id: 'Copy',
        visible: () => { return true; },
        build: (scope, items) => {
            let node = scope.selectedNodes.last();
            items.push({
                label: 'Copy',
                hotkey: 'Ctrl+C',
                disabled: !node,
                callback: () => scope.copyNodes()
            })
        }
    }, {
        id: 'Copy Path',
        visible: () => { return true; },
        build: (scope, items) => {
            let node = scope.selectedNodes.last();
            items.push({
                label: 'Copy Path',
                hotkey: 'Ctrl+Shift+C',
                disabled: !node,
                callback: () => scope.copyNodePaths()
            })
        }
    }, {
        id: 'Paste',
        visible: () => { return true },
        build: (scope, items) => {
            items.push({
                label: 'Paste',
                hotkey: 'Ctrl+V',
                disabled: !scope.canPaste(),
                callback: () => scope.paste()
            })
        }
    }]
});