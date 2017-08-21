// functions shared by mainTreeView and recordTreeView
ngapp.service('treeService', function($timeout, htmlHelpers) {
    this.buildFunctions = function(scope, element) {
        scope.getNodeForElement = function(handle) {
            let handles = xelib.GetDuplicateHandles(handle);
            for (let i = 0; i < handles.length; i++) {
                let h = handles[i],
                    newNode = scope.tree.find((node) => { return node.handle == h; });
                if (newNode) return newNode;
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
        };

        let scrollbarWidth = 17;
        scope.onTreeMouseDown = function(e) {
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