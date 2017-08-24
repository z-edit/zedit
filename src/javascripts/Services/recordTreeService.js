ngapp.service('recordTreeService', function($timeout, layoutService, recordTreeViewFactory) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'];
        let caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'];

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
            return node.handles.contains(handle);
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

        scope.updateNode = function() {
            xelib.ReleaseNodes(scope.virtualNodes);
            scope.virtualNodes = xelib.GetNodes(scope.record);
            scope.reload();
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
            node.cells.unshift({value: node.label, class: node.class});
        };

        scope.getNodeData = function(node) {
            node.has_data = true;
            scope.getNodeClass(node);
            scope.buildCells(node);
        };

        scope.buildNode = function(depth, name, elementArrays, i) {
            let handles = elementArrays.map((a) => { return a[i]; }),
                firstHandle = handles.find((handle) => { return handle > 0; }),
                valueType = firstHandle && xelib.ValueType(firstHandle),
                isFlags = valueType === xelib.vtFlags,
                canExpand = firstHandle && !isFlags && xelib.ElementCount(firstHandle) > 0;
            return {
                label: name,
                value_type: valueType,
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

        scope.buildArrayNodes = function(parentHandles, depth, name) {
            let elementArrays = parentHandles.map(function(handle) {
                    return handle ? xelib.GetNodeElements(scope.virtualNodes, handle) : [];
                }),
                maxLen = getMaxLength(elementArrays),
                nodes = [];
            for (let i = 0; i < maxLen; i++) {
                nodes.push(scope.buildNode(depth, name, elementArrays, i));
            }
            return nodes;
        };

        scope.buildNodes = function(node) {
            let names = xelib.GetDefNames(node.first_handle);
            if (!names[0].length) return [];
            if (node.value_type === xelib.vtArray) {
                return scope.buildArrayNodes(node.handles, node.depth, names[0]);
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