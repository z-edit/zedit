ngapp.service('recordViewService', function($timeout, layoutService, settingsService, xelibService, viewFactory, objectUtils, stylesheetService) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'],
            caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'],
            allowedNodeKeys = ['parent', 'label', 'child_index', 'value_type', 'handles', 'first_handle', 'can_expand', 'depth', 'expanded', 'selected', 'hidden'],
            conflicting = [xelib.caOverride, xelib.caConflict, xelib.caConflictCritical],
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
            return xelib.GetConflictData(scope.virtualNodes, handle);
        };

        let getRecordIndex = function(record) {
            if (xelib.ElementEquals(record, scope.record)) {
                return 0;
            } else {
                return scope.overrides.findIndex((ovr) => {
                    return xelib.ElementEquals(ovr, record);
                }) + 1;
            }
        };

        let getValue = function(node, handle) {
            if (node.value_type === xelib.vtFlags) {
                return xelib.GetEnabledFlags(handle).join(', ');
            } else {
                return xelib.GetValue(handle, '');
            }
        };

        let getElementArrays = function(node) {
            return node.handles.map(h => {
                return h ? xelib.GetNodeElements(scope.virtualNodes, h) : [];
            });
        };

        let getLabel = function(elementArrays, index) {
            let a = elementArrays.find(function(a) { return a.length > 0 });
            return xelib.Name(a[index]);
        };

        let isNonConflicting = function(conflictData) {
            return !conflicting.includes(conflictData[0]);
        };

        let forFirstHandle = (node, fn) => {
            return node.first_handle && fn(node.first_handle);
        };

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
            scope.virtualNodes = xelib.GetNodes(scope.record);
            let names = xelib.GetDefNames(scope.record),
                handles = scope.columns.slice(1).mapOnKey('handle'),
                elements = getElementArrays( {handles});
            scope.tree = names
                .map((name, i) => scope.buildNode(null, name, elements, i))
                .filter(node => !!node);
            if (settings.recordView.autoExpand) scope.expandAllNodes();
        };

        scope.getBaseParent = function(node) {
            while (node.parent) node = node.parent;
            return node;
        };

        scope.resolveNode = function(path, record) {
            let node = undefined,
                recordIndex = getRecordIndex(record);
            path.split('\\').forEach(function(part) {
                let handle = node ? node.handles[recordIndex] : record;
                handle = xelib.GetElementEx(handle, `${part}`);
                try {
                    node = scope.getNodeForElement(handle);
                    if (!node) throw scope.resolveNodeError(path, part);
                    if (!node.has_data) scope.getNodeData(node);
                    if (!node.expanded) scope.expandNode(node);
                } finally {
                    xelib.Release(handle);
                }
            });
            return node;
        };

        scope.navigateToElement = function(handle, open) {
            if (handle === 0) return;
            let node = xelib.WithHandle(xelib.GetElementRecord(handle), r => {
                return scope.resolveNode(xelib.LocalPath(handle), r);
            });
            if (node) {
                scope.clearSelection(true);
                scope.selectSingle(node, true, true, false);
                if (open) scope.open(node);
                $timeout(() => scope.scrollToNode(node, true));
            }
        };

        scope.nodeMatches = function(oldNode, newNode) {
            if (oldNode.depth !== newNode.depth ||
                oldNode.label !== newNode.label) return false;
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
            let selectedIndex = scope.selectedNodes.indexOf(node),
                rebuiltNode = objectUtils.rebuildObject(node, allowedNodeKeys);
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
                if (node.depth < targetDepth) return;
                if (node.depth > targetDepth) continue;
                node.child_index = node.handles[recordIndex] > 0 ?
                    counter++ : undefined;
                scope.rebuildNode(node, i);
            }
        };

        scope.updateNodeLabels = function() {
            // TODO: Union name display
            if (!settings.recordView.showArrayIndexes) return;
            scope.tree.forEach(function(node, index) {
                if (node.value_type !== xelib.vtArray ||
                    !forFirstHandle(node, xelib.IsSorted)) return;
                scope.updateSortedArrayLabels(index, node.depth + 1);
            });
        };

        scope.getNodeClass = function(node) {
            let classes = [];
            if (node.first_handle) {
                let conflictData = getConflictData(node.first_handle);
                classes.push(`${caClasses[conflictData[0]]}`);
                if (scope.hideNonConflicting && isNonConflicting(conflictData))
                    node.hidden = true;
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

        scope.buildNode = function(parent, name, elementArrays, i, setChildIndex) {
            let handles = elementArrays.map(a => a[i]),
                firstHandle = handles.find(handle => handle > 0),
                valueType = firstHandle && xelib.ValueType(firstHandle),
                isFlags = valueType === xelib.vtFlags,
                canExpand = firstHandle && !isFlags &&
                    xelib.ElementCount(firstHandle) > 0;
            return {
                label: name,
                parent: parent,
                child_index: setChildIndex ? i : undefined,
                value_type: valueType,
                handles: handles,
                first_handle: firstHandle,
                can_expand: canExpand,
                hidden: !firstHandle && !!(scope.hideUnassigned ||
                    scope.hideNonConflicting),
                depth: parent ? parent.depth + 1 : 0
            }
        };

        scope.buildStructNodes = function(node, names) {
            let elementArrays = getElementArrays(node);
            return names.map((name, i) => {
                return scope.buildNode(node, name, elementArrays, i);
            });
        };

        scope.setArrayChildIndexes = function(nodes) {
            let recordIndex = scope.focusedIndex - 1,
                counter = 0;
            nodes.filter(node => node.handles[recordIndex] > 0)
                .forEach(node => node.child_index = counter++);
        };

        scope.buildArrayNodes = function(node, name) {
            let showArrayIndexes = settings.recordView.showArrayIndexes,
                sorted = forFirstHandle(node, xelib.IsSorted),
                useLabels = forFirstHandle(node, xelib.IsFixed),
                elementArrays = getElementArrays(node),
                maxLen = getMaxLength(elementArrays),
                setChildIndex = showArrayIndexes && !sorted && !useLabels,
                nodes = [];
            for (let i = 0; i < maxLen; i++)
                nodes.push(scope.buildNode(node,
                    useLabels ? getLabel(elementArrays, i) : name,
                    elementArrays, i, setChildIndex));
            if (sorted && showArrayIndexes) scope.setArrayChildIndexes(nodes);
            return nodes;
        };

        scope.buildNodes = function(node) {
            let names = xelib.GetDefNames(node.first_handle);
            if (!names[0].length) return [];
            return node.value_type === xelib.vtArray ?
                scope.buildArrayNodes(node, names[0]) :
                scope.buildStructNodes(node, names);
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

        scope.linkToView = function(className) {
            let targetView = layoutService.findView(view => {
                return view.class === className && !view.linkedRecordView;
            });
            viewFactory.link(scope.view, targetView);
        };

        scope.syncWithReferencedByView = function(record) {
            let referencedByView = scope.view.linkedReferencedByView;
            if (referencedByView) {
                referencedByView.scope.record = xelib.GetElementEx(record, '');
            }
        };
    };
});
