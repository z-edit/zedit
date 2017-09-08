ngapp.service('recordTreeService', function($timeout, layoutService, settingsService, recordTreeViewFactory, objectUtils) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'],
            caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'],
            settings = settingsService.settings;

        // helper functions
        let getRecordFileName = function(record) {
            let fileName = '';
            xelib.WithHandle(xelib.GetElementFile(record), function(file) {
                fileName = xelib.DisplayName(file);
            });
            return fileName;
        };

        let getMaxLength = function(arrays) {
            let maxLen = 0;
            arrays.forEach(function(a) {
                let len = a.length;
                if (len > maxLen) maxLen = len;
            });
            return maxLen;
        };

        let getConflictData = function(handle) {
            return xelib.GetConflictData(scope.virtualNodes, handle, false, true);
        };

        let getValue = function(node, handle) {
            if (node.value_type === xelib.vtFlags) {
                return xelib.GetEnabledFlags(handle).join(', ');
            } else {
                return xelib.GetValue(handle, '', true);
            }
        };

        // inherited functions
        scope.releaseTree = recordTreeViewFactory.releaseTree;

        // scope functions
        scope.buildColumns = function() {
            scope.columns = [{
                label: 'Element Name',
                width: '250px'
            },{
                label: getRecordFileName(scope.record),
                handle: scope.record,
                width: '300px'
            }];
            scope.overrides = xelib.GetOverrides(scope.record);
            scope.overrides.forEach(function(override) {
                scope.columns.push({
                    label: getRecordFileName(override),
                    handle: override,
                    width: '300px'
                })
            });
            scope.resizeColumns();
        };

        scope.buildTree = function() {
            let names = xelib.GetDefNames(scope.record);
            let handles = scope.columns.slice(1).map((column) => { return column.handle; });
            scope.virtualNodes = xelib.GetNodes(scope.record);
            scope.tree = scope.buildStructNodes(handles, -1, names);
            if (settings.recordView.autoExpand) scope.expandAllNodes();
        };

        scope.getBaseParent = function(node) {
            while (node.parent) node = node.parent;
            return node;
        };

        scope.nodeMatches = function(oldNode, newNode) {
            if (oldNode.depth !== newNode.depth || oldNode.label !== newNode.label) {
                return false;
            }
            return oldNode.handles.reduce(function(b, oldHandle, index) {
                let newHandle = newNode.handles[index];
                return b || oldHandle && newHandle && xelib.ElementEquals(oldHandle, newHandle);
            }, false);
        };

        scope.nodeHasHandle = function(node, handle) {
            return node.handles.includes(handle);
        };

        scope.getNewNode = function(node) {
            for (let i = 0; i < node.handles.length; i++) {
                let handle = node.handles[i];
                if (!handle) continue;
                let newNode = scope.getNodeForElement(handle);
                if (newNode) return newNode;
            }
        };

        scope.getElementPath = function(handle) {
            return xelib.LocalPath(handle);
        };

        scope.updateNodes = function() {
            xelib.ReleaseNodes(scope.virtualNodes);
            scope.virtualNodes = xelib.GetNodes(scope.record);
            scope.reload();
        };

        scope.rebuildNode = function(node, index) {
            if (!index) index = scope.tree.indexOf(node);
            let allowedKeys = ['parent', 'label', 'child_index', 'value_type', 'is_sorted', 'handles', 'first_handle', 'disabled', 'can_expand', 'depth', 'expanded', 'selected'],
                selectedIndex = scope.selectedNodes.indexOf(node),
                rebuiltNode = objectUtils.rebuildObject(node, allowedKeys);
            scope.tree.splice(index, 1, rebuiltNode);
            if (selectedIndex > -1) {
                scope.selectedNodes.splice(selectedIndex, 1, rebuiltNode);
                if (scope.prevNode === node) scope.prevNode = rebuiltNode;
            }
        };

        scope.updateSortedArrayLabels = function(index, targetDepth) {
            let recordIndex = scope.focusedIndex - 1,
                counter = 0;
            for (let i = index + 1; i < scope.tree.length; i++) {
                let node = scope.tree[i];
                if (node.depth === targetDepth) {
                    node.child_index = node.handles[recordIndex] ? counter++ : undefined;
                    scope.rebuildNode(node, i);
                } else if (node.depth < targetDepth) {
                    return;
                }
            }
        };

        scope.updateNodeLabels = function() {
            // TODO: When we figure out union name display, we need to move this
            if (!settings.recordView.showArrayIndexes) return;
            scope.tree.forEach(function(node, index) {
                if (node.disabled) return;
                if (node.value_type === xelib.vtArray && node.is_sorted) {
                    scope.updateSortedArrayLabels(index, node.depth + 1);
                }
            });
        };

        scope.getNodeClass = function(node) {
            let classes = [];
            if (node.first_handle) {
                let conflictData = getConflictData(node.first_handle);
                classes.push(`${caClasses[conflictData[0]]}`);
            } else {
                classes.push('element-unassigned');
            }
            node.class = classes.join(' ');
        };

        scope.getLabel = function(node) {
            if (angular.isDefined(node.child_index)) {
                return `${node.label} [${node.child_index}]`;
            } else {
                return node.label;
            }
        };

        scope.buildCells = function(node) {
            let nodeModified = false;
            node.cells = [];
            node.handles.forEach(function(handle) {
                let value, classes = [];
                if (handle) {
                    let conflictData = getConflictData(handle);
                    value = getValue(node, handle);
                    classes.push(ctClasses[conflictData[1]]);
                    if (xelib.GetIsModified(handle)) {
                        nodeModified = true;
                        classes.push('modified');
                    }
                }
                node.cells.push({
                    value: value || '',
                    class: classes.join(' ')
                });
            });
            if (nodeModified) scope.addModifiedClass(node);
            node.cells.unshift({value: scope.getLabel(node), class: node.class});
        };

        scope.getNodeData = function(node) {
            node.has_data = true;
            scope.getNodeClass(node);
            scope.buildCells(node);
        };

        scope.buildNode = function(depth, name, elementArrays, i, setChildIndex) {
            let handles = elementArrays.map((a) => { return a[i]; }),
                firstHandle = handles.find((handle) => { return handle > 0; }),
                valueType = firstHandle && xelib.ValueType(firstHandle),
                isFlags = valueType === xelib.vtFlags,
                isSorted = valueType === xelib.vtArray && xelib.IsSorted(firstHandle),
                canExpand = firstHandle && !isFlags && xelib.ElementCount(firstHandle) > 0;
            return {
                label: name,
                child_index: setChildIndex ? i : undefined,
                value_type: valueType,
                is_sorted: isSorted,
                handles: handles,
                first_handle: firstHandle,
                disabled: !firstHandle,
                can_expand: canExpand,
                depth: depth + 1
            }
        };

        scope.buildStructNodes = function(parentHandles, depth, names) {
            let elementArrays = parentHandles.map(function(handle) {
                    return handle ? xelib.GetNodeElements(scope.virtualNodes, handle) : [];
                }),
                nodes = [];
            for (let i = 0; i < names.length; i++) {
                nodes.push(scope.buildNode(depth, names[i], elementArrays, i))
            }
            return nodes;
        };

        scope.setArrayChildIndexes = function(nodes) {
            let recordIndex = scope.focusedIndex - 1,
                counter = 0;
            nodes.forEach(function(node) {
                if (node.handles[recordIndex]) node.child_index = counter++;
            });
        };

        scope.buildArrayNodes = function(parentHandles, depth, name, sorted) {
            let elementArrays = parentHandles.map(function(handle) {
                    return handle ? xelib.GetNodeElements(scope.virtualNodes, handle) : [];
                }),
                maxLen = getMaxLength(elementArrays),
                setChildIndex = settings.recordView.showArrayIndexes && !sorted,
                nodes = [];
            for (let i = 0; i < maxLen; i++) {
                nodes.push(scope.buildNode(depth, name, elementArrays, i, setChildIndex));
            }
            if (sorted && settings.recordView.showArrayIndexes) {
                scope.setArrayChildIndexes(nodes);
            }
            return nodes;
        };

        scope.buildNodes = function(node) {
            let names = xelib.GetDefNames(node.first_handle);
            if (!names[0].length) return [];
            if (node.value_type === xelib.vtArray) {
                return scope.buildArrayNodes(node.handles, node.depth, names[0], node.is_sorted);
            } else {
                return scope.buildStructNodes(node.handles, node.depth, names);
            }
        };

        scope.expandAllNodes = function() {
            let i = 0,
                len = scope.tree.length;
            while (i < len) {
                let node = scope.tree[i];
                if (node.can_expand && !node.expanded) {
                    scope.expandNode(node);
                    len = scope.tree.length;
                }
                i++;
            }
        };

        scope.collapseAllNodes = function() {
            let i = 0,
                len = scope.tree.length;
            while (i < len) {
                let node = scope.tree[i];
                if (node.expanded) {
                    scope.collapseNode(node);
                    len = scope.tree.length;
                }
                i++;
            }
        };

        scope.linkToMainTreeView = function() {
            let mainTreeView = layoutService.findView(function(view) {
                return view.class === 'main-tree-view';
            });
            if (!mainTreeView.data.linkedScope) {
                mainTreeView.data.linkedScope = scope;
                scope.linked = true;
            }
        };
    };
});