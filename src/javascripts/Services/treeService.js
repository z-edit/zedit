// functions shared by mainTreeView and recordTreeView
ngapp.service('treeService', function($timeout, htmlHelpers) {
    this.buildFunctions = function(scope, element) {
        // helper fucntions
        let reExpandNode = function(node) {
            let newNode = scope.getNewNode(node);
            if (newNode) {
                scope.getNodeData(newNode);
                scope.expandNode(newNode);
            }
        };

        let reSelectNode = function(node, scroll) {
            let newNode = scope.getNewNode(node);
            if (newNode) {
                scope.selectSingle(newNode, true, true, false);
                if (scroll) scope.scrollToNode(newNode, true);
            }
        };

        scope.reload = function() {
            let oldExpandedNodes = scope.tree.filter((node) => { return node.expanded; }),
                oldSelectedNodes = scope.selectedNodes.slice(),
                oldTree = scope.tree;
            scope.clearSelection(true);
            scope.buildTree();
            oldExpandedNodes.forEach((n) => reExpandNode(n));
            oldSelectedNodes.forEach((n, i, a) => reSelectNode(n, i == a.length - 1));
            scope.releaseTree(oldTree);
        };

        scope.getNodeForElement = function(handle) {
            let handles = xelib.GetDuplicateHandles(handle);
            for (let j = 0; j < handles.length; j++) {
                let h = handles[j],
                    newNode = scope.tree.find(function(node) {
                        return scope.nodeHasHandle(node, h)
                    });
                if (newNode) return newNode;
            }
        };

        scope.resolveNode = function(path) {
            let node = undefined;
            path.split('\\').forEach(function(part) {
                let handle = node ? node.handle : 0;
                xelib.WithHandle(xelib.GetElement(handle, `${part}`), function(handle) {
                    if (part !== 'Child Group') {
                        node = scope.getNodeForElement(handle);
                        if (!node) throw `Failed to resolve node "${part}" in path "${path}"`;
                        if (!node.has_data) scope.getNodeData(node);
                        if (!node.expanded) scope.expandNode(node);
                    }
                });
            });
            return node;
        };

        scope.navigateToElement = function(handle, open) {
            let node = scope.resolveNode(scope.getPath(handle));
            if (node) {
                scope.clearSelection(true);
                scope.selectSingle(node, true, true, false);
                $timeout(function() {
                    scope.scrollToNode(node, true);
                    if (open) scope.open(node);
                });
            }
        };

        scope.addModifiedClass = function(item) {
            let classes = item.class.split(' ');
            if (!classes.contains('modified')) {
                classes.push('modified');
                item.class = classes.join(' ');
            }
        };

        scope.setNodeModified = function(node) {
            while (node) {
                scope.addModifiedClass(node);
                node = node.parent;
            }
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
            removedNodes.forEach(function(node) {
                if (node.handle) xelib.Release(node.handle);
                if (node.handles) {
                    node.handles.forEach((handle) => handle && xelib.Release(handle));
                }
            });
            if (scope.prevNode && scope.prevNode.parent === node) {
                scope.prevNode = undefined;
            }
        };

        scope.toggleNode = function(e, node) {
            e && e.stopImmediatePropagation();
            scope[node.expanded ? 'collapseNode' : 'expandNode'](node);
            scope.$emit('closeContextMenu');
        };

        scope.onNodeMouseDown = function(e, node) {
            scope.selectNode(e, node);
            if (e.button == 2) scope.showNodeContextMenu(e, node);
        };

        let scrollbarWidth = 17;
        scope.onTreeMouseDown = function(e) {
            if (!e.srcElement.classList.contains('tree-nodes')) return;
            let t = scope.treeElement;
            if (e.clientX - t.offsetLeft < t.offsetWidth - scrollbarWidth) {
                scope.clearSelection(true);
            }
        };

        scope.focusSearchInput = function() {
            let searchInput = htmlHelpers.resolveElement(scope.tabView, 'search-bar/input');
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
            scope.tabView = element[0].nextElementSibling;
            scope.treeElement = htmlHelpers.resolveElement(scope.tabView, '.tree-nodes');
            scope.columnsElement = htmlHelpers.resolveElement(scope.tabView, '.column-wrapper');
        };
    }
});