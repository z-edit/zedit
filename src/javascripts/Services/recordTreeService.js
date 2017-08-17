ngapp.service('recordTreeService', function(layoutService) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'];
        let caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'];
        let arrayTypes = [xelib.dtSubRecordArray, xelib.dtArray];

        // helper functions
        let getMaxLength = function(arrays) {
            let maxLen = 0;
            arrays.forEach(function(a) {
                let len = a.length;
                if (len > maxLen) maxLen = len;
            });
            return maxLen;
        };

        // scope functions
        scope.getNodeClass = function(node) {
            let classes = [];
            if (node.first_handle) {
                //if (xelib.GetModified(node.first_handle)) classes.push('modified');
                let conflictData = xelib.GetConflictData(scope.virtualNodes, node.first_handle, false, true);
                classes.push(`${caClasses[conflictData[0]]}`);
            } else {
                classes.push('element-unassigned');
            }
            node.class = classes.join(' ');
        };

        scope.buildCells = function(node) {
            node.cells = [{value: node.label}];
            node.handles.forEach(function(handle) {
                let value = handle && (node.is_flags ? xelib.GetEnabledFlags(handle).join(', ') : xelib.GetValue(handle, '', true));
                let conflictData = handle && xelib.GetConflictData(scope.virtualNodes, handle, false, true);
                node.cells.push({
                    value: value || '',
                    class: handle ? ctClasses[conflictData[1]] : ''
                });
            });
        };

        scope.getNodeData = function(node) {
            node.has_data = true;
            scope.getNodeClass(node);
            scope.buildCells(node);
        };

        scope.buildStructNode = function(parentHandles, depth, name) {
            let handles = parentHandles.map(function(handle) {
                    return handle ? xelib.GetElement(handle, name, true) : 0;
                }),
                firstHandle = handles.find((handle) => { return handle > 0; }),
                defType = firstHandle && xelib.DefType(firstHandle),
                isFlags = defType == xelib.dtInteger && xelib.IsFlags(firstHandle),
                isArray = arrayTypes.contains(defType);
            return {
                label: name,
                def_type: defType,
                is_flags: isFlags,
                is_array: isArray,
                handles: handles,
                first_handle: firstHandle,
                disabled: !firstHandle,
                can_expand: firstHandle && !isFlags && xelib.ElementCount(firstHandle),
                depth: depth + 1
            }
        };

        scope.buildStructNodes = function(handles, depth, names) {
            return names.map(function(name) {
                return scope.buildStructNode(handles, depth, name);
            });
        };

        scope.buildArrayNode = function(depth, baseName, elementArrays, i) {
            let handles = elementArrays.map((a) => { return a[i] || 0 }),
                firstHandle = handles.find((handle) => { return handle > 0; }),
                defType = firstHandle && xelib.DefType(firstHandle);
            return {
                label: `[${i}] ${baseName}`,
                def_type: defType,
                handles: handles,
                first_handle: firstHandle,
                can_expand: firstHandle && xelib.ElementCount(firstHandle) > 0,
                depth: depth + 1
            }
        };

        scope.buildArrayNodes = function(handles, depth, baseName) {
            let elementArrays = handles.map(function(handle) {
                    return handle ? xelib.GetElements(handle) : [];
                }),
                maxLen = getMaxLength(elementArrays),
                nodes = [];
            for (let i = 0; i < maxLen; i++) {
                nodes.push(scope.buildArrayNode(depth, baseName, elementArrays, i));
            }
            return nodes;
        };

        scope.buildNodes = function(node) {
            let names = xelib.GetDefNames(node.first_handle);
            if (!names[0].length) return [];
            if (node.is_array) {
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