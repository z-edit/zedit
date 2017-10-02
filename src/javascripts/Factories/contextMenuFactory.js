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

    this.mainTreeItems = [{
        id: 'Add',
        visible: (scope) => {
            let node = scope.selectedNodes.last();
            if (!node) return;
            return node.element_type !== xelib.etMainRecord && xelib.GetCanAdd(node.handle);
        },
        build: (scope, items) => {
            let node = scope.selectedNodes.last(),
                addList = xelib.GetAddList(node.handle),
                isFile = node.element_type === xelib.etFile;
            items.push({
                label: `Add ${isFile ? 'Group' : 'Record'}`,
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
                    disabled: true,
                    callback: () => scope.$emit('openModal', 'refactor', {
                        refactorMode: 'Name'
                    })
                }, {
                    label: 'Change EditorIDs',
                    hotkey: 'Alt+Shift+E',
                    disabled: true,
                    callback: () => scope.$emit('openModal', 'refactor', {
                        refactorMode: 'EditorID'
                    })
                }, {
                    label: 'Change FormIDs',
                    hotkey: 'Alt+Shift+F',
                    disabled: true,
                    callback: () => scope.$emit('openModal', 'refactor', {
                        refactorMode: 'FormID'
                    })
                });
            }
            items.push({
                label: 'Refactor',
                children: children
            });
        }
    }, {
        id: 'Masters',
        visible: (scope) => {
            if (!scope.selectedNodes.length) return;
            let nodes = scope.selectedNodes, node = nodes.last();
            return node.element_type === xelib.etFile && xelib.GetIsEditable(node.handle);
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
                    disabled: true,
                    callback: () => scope.sortMasters(node)
                }, {
                    label: 'Clean Masters',
                    disabled: true,
                    callback: () => scope.cleanMasters(node)
                }]
            });
        }
    },{
        id: 'Enable Editing',
        visible: (scope) => {
            if (!scope.selectedNodes.length) return;
            return testNodes(scope.selectedNodes, function(node) {
                return node.element_type === xelib.etFile && !xelib.GetIsEditable(node.handle);
            });
        },
        build: (scope, items) => {
            items.push({
                label: 'Enable Editing',
                hotkey: 'Ctrl+E',
                disabled: true,
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
                callback: () => scope.$emit('openModal', 'automate', {
                    targetScope: scope
                })
            })
        }
    }, {
        id: 'Advanced Search',
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Advanced Search',
                hotkey: 'Ctrl+Shift+F',
                disabled: true,
                callback: () => scope.$emit('openModal', 'advancedSearch')
            })
        }
    }, {
        id: 'Open',
        visible: (scope) => {
            let node = scope.selectedNodes.last();
            if (!node) return;
            return node.element_type !== xelib.etGroupRecord;
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
        visible: () => { return true; },
        build: (scope, items) => {
            items.push({
                label: 'Copy To',
                hotkey: 'Ctrl+Alt+C',
                disabled: true,
                callback: () => scope.copyNodesTo()
            })
        }
    },{
        id: 'Copy',
        visible: () => { return true; },
        build: (scope, items) => {
            let node = scope.selectedNodes.last();
            items.push({
                label: 'Copy',
                hotkey: 'Ctrl+C',
                disabled: true,//!node,
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
                disabled: true,//!node,
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
                disabled: true,//!scope.canPaste(),
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
                disabled: true,//!scope.canPaste(true),
                callback: () => scope.paste(true)
            })
        }
    }];

    this.recordTreeItems = [{
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
        id: 'Copy',
        visible: () => { return true; },
        build: (scope, items) => {
            let node = scope.selectedNodes.last();
            items.push({
                label: 'Copy',
                hotkey: 'Ctrl+C',
                disabled: true,//!node,
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
                disabled: true,//!node,
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
                disabled: true,//!scope.canPaste(),
                callback: () => scope.paste()
            })
        }
    }]
});
