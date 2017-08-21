ngapp.service('nodeSelectionService', function() {
    this.buildFunctions = function(scope) {
        // initialize variables
        var lastRange = [];
        var nodeHeight = 20;
        scope.selectedNodes = [];

        // scope and helper functions
        scope.clearSelection = function(clearPrevNode) {
            lastRange = [];
            scope.selectedNodes.forEach((node) => node.selected = false);
            scope.selectedNodes = [];
            if (clearPrevNode) scope.prevNode = undefined;
        };

        scope.scrollTo = function(offset) {
            scope.treeElement.scrollTop = offset;
        };

        scope.scrollToNode = function(node, center = false) {
            let index = scope.tree.indexOf(node);
            let nodeOffset = index * nodeHeight;
            let scrollOffset = scope.treeElement.scrollTop;
            let height = scope.treeElement.clientHeight;
            if (center) {
                scope.scrollTo(nodeOffset - Math.floor(height / 2));
            } else if (scrollOffset + height < nodeOffset + nodeHeight) {
                scope.scrollTo(nodeOffset - height + nodeHeight);
            } else if (scrollOffset > nodeOffset) {
                scope.scrollTo(nodeOffset);
            }
        };

        scope.lastSelectedNode = function() {
            return scope.selectedNodes.last();
        };

        scope.selectSingle = function(node, newValue, setPrev = true, scroll = true) {
            if (!node || node.disabled || newValue && node.selected) return;
            if (scope.selectedNodes.length > 0 && node.depth != scope.prevNode.depth) return;
            node.selected = angular.isDefined(newValue) ? newValue : !node.selected;
            scope.selectedNodes[node.selected ? 'push' : 'remove'](node);
            if (node.selected) {
                if (setPrev) scope.prevNode = node;
                if (scroll) scope.scrollToNode(node);
            }
        };

        var persistRange = function(start, end) {
            if (start > lastRange[0]) {
                scope.selectSingle(scope.tree[lastRange[0]], false, false, false);
            }
            if (end < lastRange[1]) {
                scope.selectSingle(scope.tree[lastRange[1]], false, false, false);
            }
        };

        scope.selectRange = function(n1, n2, persist = false) {
            if (n1.depth !== n2.depth) return;
            let i1 = scope.tree.indexOf(n1),
                i2 = scope.tree.indexOf(n2),
                startIndex = Math.min(i1, i2),
                endIndex = Math.max(i1, i2),
                targetDepth = n1.depth;
            persist && lastRange.length && persistRange(startIndex, endIndex);
            lastRange = [startIndex, endIndex];
            if (i1 < i2) {
                for (let i = i2; i >= i1; i--) {
                    let node = scope.tree[i];
                    if (node.depth === targetDepth) {
                        scope.selectSingle(node, true, false, false);
                    }
                }
            } else {
                for (let i = i2; i <= i1; i++) {
                    let node = scope.tree[i];
                    if (node.depth === targetDepth) {
                        scope.selectSingle(node, true, false, false);
                    }
                }
            }
        };

        scope.selectNode = function(e, node) {
            lastRange = [];
            if (!e.ctrlKey) scope.clearSelection();
            if (e.shiftKey && scope.prevNode) {
                scope.selectRange(node, scope.prevNode);
            } else {
                scope.selectSingle(node);
            }
            e.stopImmediatePropagation();
        };

        // expand node or navigate to first child when right arrow is pressed
        scope.handleRightArrow = function(e) {
            let node = scope.selectedNodes.last();
            if (!node || !node.can_expand) return;
            scope.clearSelection();
            if (!node.expanded) {
                scope.expandNode(node);
                scope.selectSingle(node);
            } else {
                let index = scope.tree.indexOf(node) + 1;
                scope.selectSingle(scope.tree[index]);
            }
        };

        // navigate to parent or collapse node when left arrow is pressed
        scope.handleLeftArrow = function(e) {
            let node = scope.selectedNodes.last();
            if (node.expanded) {
                scope.clearSelection();
                scope.collapseNode(node);
                scope.selectSingle(node);
            } else if (node.parent) {
                scope.clearSelection();
                scope.selectSingle(node.parent);
            }
        };

        var findNextNode = function(node, sameDepth = true) {
            let index = scope.tree.indexOf(node);
            if (!sameDepth) {
                return scope.tree[index + 1];
            } else {
                let targetDepth = node.depth;
                for (let i = index + 1; i < scope.tree.length; i++) {
                    let n = scope.tree[i];
                    if (n.depth == targetDepth) return n;
                    if (n.depth < targetDepth) return;
                }
            }
        };

        //navigate down a node when down arrow is pressed
        scope.handleDownArrow = function(e) {
            let node = scope.selectedNodes.last();
            if (!node) return;
            let targetNode = findNextNode(node, e.shiftKey);
            if (!targetNode) return;
            if (e.shiftKey) {
                scope.selectRange(targetNode, scope.prevNode, true);
                scope.scrollToNode(targetNode);
            } else {
                scope.clearSelection();
                scope.selectSingle(targetNode);
            }
        };

        var findPreviousNode = function(node, sameDepth = true) {
            let index = scope.tree.indexOf(node);
            if (!sameDepth) {
                return scope.tree[index - 1];
            } else {
                let targetDepth = node.depth;
                for (let i = index - 1; i >= 0; i++) {
                    let n = scope.tree[i];
                    if (n.depth == targetDepth) return n;
                    if (n.depth < targetDepth) return;
                }
            }
        };

        //navigate up a node when up arrow is pressed
        scope.handleUpArrow = function(e) {
            let node = scope.selectedNodes.last();
            if (!node) return;
            let targetNode = findPreviousNode(node, e.shiftKey);
            if (!targetNode) return;
            if (e.shiftKey) {
                scope.selectRange(targetNode, scope.prevNode, true);
                scope.scrollToNode(targetNode);
            } else {
                scope.clearSelection();
                scope.selectSingle(targetNode);
            }
        };
    };
});