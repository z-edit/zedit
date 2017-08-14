// functions shared by mainTreeView and recordTreeView
ngapp.service('treeService', function() {
    this.buildFunctions = function(scope, element) {
        scope.getNodeForElement = function(handle) {
            let handles = xelib.GetDuplicateHandles(handle);
            for (let i = 0; i < handles.length; i++) {
                let h = handles[i];
                let newNode = scope.tree.find((node) => { return node.handle == h; });
                if (newNode) return newNode;
            }
        };

        scope.expandNode = function(node) {
            if (!node.can_expand) return;
            let start = Date.now();
            node.expanded = true;
            let children = scope.buildNodes(node);
            let childrenLength = children.length;
            if (childrenLength > 0) {
                children.forEach((child) => child.parent = node);
                let insertionIndex = scope.tree.indexOf(node) + 1;
                scope.tree.splice(insertionIndex, 0, ...children);
                console.log(`Built ${childrenLength} nodes in ${Date.now() - start}ms`);
            } else {
                node.can_expand = false;
                node.expanded = false;
            }
        };

        scope.collapseNode = function(node) {
            if (node.expanded) delete node.expanded;
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
            if (node.expanded) {
                scope.collapseNode(node);
            } else {
                scope.expandNode(node);
            }
            e.stopPropagation();
        };

        let scrollbarWidth = 17;
        scope.treeMouseDown = function(e) {
            let t = scope.treeElement;
            if (e.clientX - t.offsetLeft < t.offsetWidth - scrollbarWidth) {
                scope.clearSelection(true);
            }
        };

        scope.toggleSearch = function(visible) {
            scope.showSearch = visible;
            if (!visible) scope.treeElement.focus();
        };

        scope.onKeyDown = function(e) {
            if (e.keyCode == 39) {
                scope.handleRightArrow(e);
            } else if (e.keyCode == 37) {
                scope.handleLeftArrow(e);
            } else if (e.keyCode == 40) {
                scope.handleDownArrow(e)
            } else if (e.keyCode == 38) {
                scope.handleUpArrow(e);
            } else if (e.ctrlKey && !e.shiftKey && e.keyCode == 70) {
                scope.toggleSearch(true);
            } else {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
        };

        scope.resolveTreeElement = function() {
            let tabView = element[0].nextElementSibling;
            let treeNodes = tabView.lastElementChild;
            scope.treeElement = treeNodes.firstElementChild;
        };
    }
});