ngapp.factory('treeInterface', function($timeout, htmlHelpers) {
    let {resolveElement} = htmlHelpers;

    let buildTabViewFunctions = function(scope, element) {
        scope.focusSearchInput = function() {
            let searchInput = resolveElement(scope.tabView, 'search-bar/input');
            searchInput.focus();
        };

        scope.toggleSearchBar = function(visible) {
            scope.showSearchBar = visible;
            if (visible) {
                $timeout(scope.focusSearchInput, 50);
            } else {
                scope.treeElement.focus();
            }
        };

        scope.resolveElements = function() {
            scope.tabView = element[0];
            scope.treeElement = resolveElement(scope.tabView, '.nodes');
            scope.columnsElement = resolveElement(scope.tabView, '.column-wrapper');
        };
    };

    let buildHandleFunctions = function(scope) {
        scope.getNodeForElement = function(handle) {
            let handles = xelib.GetDuplicateHandles(handle);
            for (let j = 0; j < handles.length; j++) {
                let newNode = scope.tree.find(node => {
                    return scope.nodeHasHandle(node, handles[j])
                });
                if (newNode) return newNode;
            }
        };

        scope.cleanupNode = function(node) {
            if (node.handle) xelib.Release(node.handle);
            if (node.kac) xelib.Release(node.kac);
            if (!node.handles) return;
            node.handles.forEach(handle => handle && xelib.Release(handle));
        };
    };

    return function(scope, element, tabView = true, handles = true) {
        // helper fucntions
        let reExpandNode = function(node) {
            let newNode = scope.getNewNode(node);
            if (!newNode) return;
            scope.getNodeData(newNode);
            scope.expandNode(newNode);
        };

        let reSelectNode = function(node) {
            let newNode = scope.getNewNode(node);
            if (newNode) scope.selectSingle(newNode, true, true, false);
        };

        scope.reload = function() {
            if (!scope.tree) return;
            let scrollOffset = scope.treeElement.scrollTop,
                oldExpandedNodes = scope.tree.filter(node => node.expanded),
                oldSelectedNodes = scope.selectedNodes.slice(),
                oldTree = scope.tree;
            scope.clearSelection(true);
            scope.buildTree();
            oldExpandedNodes.forEach(n => reExpandNode(n));
            oldSelectedNodes.forEach(n => reSelectNode(n));
            scope.view.releaseTree(oldTree);
            scope.treeElement.scrollTop = scrollOffset;
        };

        scope.addModifiedClass = function(item) {
            let classes = item.class.split(' ');
            if (!classes.includes('modified')) {
                classes.push('modified');
                item.class = classes.join(' ');
            }
        };

        scope.setNodeModified = function(node) {
            while (node) {
                if (node.has_data) scope.addModifiedClass(node);
                node = node.parent;
            }
        };

        scope.resolveNodeError = (path, part) => {
            return new Error(`Failed to resolve node "${part}" in path "${path}"`);
        };

        scope.getChildNodes = function(node, includeGrandChildren = false) {
            let index = scope.tree.indexOf(node) + 1,
                nodes = [];
            for (; index < scope.tree.length; index++) {
                let child = scope.tree[index];
                let depthDiff = child.depth - node.depth;
                if (depthDiff < 1) return nodes;
                if (depthDiff > 1 && !includeGrandChildren) continue;
                nodes.push(child);
            }
        };

        scope.hasNoChildren = function(node) {
            let checkIndex = scope.tree.indexOf(node) + 1;
            if (checkIndex >= scope.tree.length) return true;
            return scope.tree[checkIndex].depth <= node.depth;
        };

        scope.expandNode = function(node) {
            if (!node.can_expand || node.expanded) return;
            let start = Date.now(),
                children = scope.buildNodes(node),
                childrenLength = children.length;
            if (childrenLength > 0) {
                children.forEach((child) => child.parent = node);
                console.log(`Built ${childrenLength} nodes in ${Date.now() - start}ms`);
                node.expanded = true;
                let insertionIndex = scope.tree.indexOf(node) + 1;
                scope.tree.splice(insertionIndex, 0, ...children);
            } else {
                node.can_expand = false;
            }
        };

        scope.expandChildren = function(node) {
            scope.expandNode(node);
            let i = scope.tree.indexOf(node) + 1,
                targetDepth = node.depth;
            for (; i < scope.tree.length; i++) {
                node = scope.tree[i];
                if (node.depth <= targetDepth) return;
                scope.expandNode(node);
            }
        };

        scope.collapseNode = function(node) {
            if (!node.expanded) return;
            delete node.expanded;
            let startIndex = scope.tree.indexOf(node) + 1,
                endIndex = startIndex;
            for (; endIndex < scope.tree.length; endIndex++) {
                let child = scope.tree[endIndex];
                if (child.depth <= node.depth) break;
                if (child.selected) scope.selectSingle(child, false);
            }
            let removedNodes = scope.tree.splice(startIndex, endIndex - startIndex);
            if (scope.cleanupNode) removedNodes.forEach(scope.cleanupNode);
            if (scope.prevNode && scope.prevNode.parent === node)
                scope.prevNode = undefined;
        };

        scope.toggleNode = function(e, node) {
            e && e.stopImmediatePropagation();
            scope[node.expanded ? 'collapseNode' : 'expandNode'](node);
            scope.$emit('closeContextMenu');
        };

        scope.onNodeMouseDown = function(e, node) {
            if (e.button !== 2 || !node.selected) scope.selectNode(e, node);
            if (e.button === 2) scope.showContextMenu(e);
        };

        let scrollbarWidth = 17;
        scope.onTreeMouseDown = function(e) {
            if (!e.srcElement.classList.contains('nodes')) return;
            let t = scope.treeElement;
            if (e.clientX - t.offsetLeft < t.offsetWidth - scrollbarWidth)
                scope.clearSelection(true);
            if (e.button === 2) scope.showContextMenu(e);
        };

        if (tabView) buildTabViewFunctions(scope, element);
        if (handles) buildHandleFunctions(scope);
    };
});
