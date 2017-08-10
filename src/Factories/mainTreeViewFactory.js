export default function(ngapp, xelib) {
    var mainTreeViewController = function($scope, $element, $timeout, xelibService) {
        // TODO: Load this from disk
        $scope.columns = [
            {
                label: "FormID",
                canSort: true,
                width: '315px',
                getData: function(node) {
                    switch (node.element_type) {
                        case 'etFile':
                            return xelib.DisplayName(node.handle);
                        case 'etGroupRecord':
                            // TODO: include signature as well based on setting
                            return xelib.Name(node.handle);
                        case 'etMainRecord':
                            if (node.fid == 0) {
                                return 'File Header';
                            } else {
                                return xelibService.intToHex(node.fid, 8);
                            }
                    }
                }
            },
            {
                label: "EditorID",
                canSort: true,
                width: '150px',
                getData: function(node) {
                    if (node.element_type === 'etMainRecord' && node.fid > 0) {
                        return xelib.EditorID(node.handle, true);
                    }
                }
            },
            {
                label: "Name",
                canSort: true,
                getData: function(node) {
                    if (node.element_type === 'etMainRecord' && node.fid > 0) {
                        return xelib.FullName(node.handle, true);
                    }
                }
            }
        ];

        var tree;
        $scope.sort = {
            column: 'FormID',
            reverse: false
        };

        $scope.buildTree = function() {
            tree = xelib.GetElements(0, '', $scope.sort.column).map(function(handle) {
                return $scope.buildNode(handle, -1);
            });
            if ($scope.sort.reverse) tree.reverse();
            $scope.data.tree = tree;
        };

        var getNewNode = function(node) {
            let handles = xelib.GetDuplicateHandles(node.handle);
            for (let i = 0; i < handles.length; i++) {
                let handle = handles[i];
                let newNode = tree.find((node) => { return node.handle == handle; });
                if (newNode) return newNode;
            }
        };

        var reExpandNode = function(node) {
            let newNode = getNewNode(node);
            if (newNode) {
                $scope.getNodeData(newNode);
                $scope.expandNode(newNode);
            }
        };

        var reSelectNode = function(node, scroll) {
            let newNode = getNewNode(node);
            if (newNode) {
                selectSingle(newNode, true, true, false);
                if (scroll) scrollToNode(newNode, true);
            }
        };

        var freeHandles = function(nodes1, nodes2) {
            let a = [];
            nodes1.forEach((n) => a.contains(n.handle) || a.push(n.handle));
            nodes2.forEach((n) => a.contains(n.handle) || a.push(n.handle));
            a.forEach((handle) => xelib.Release(handle));
        };

        $scope.reloadNodes = function() {
            let start = Date.now();
            $scope.reloading = true;
            let oldExpandedNodes = [];
            let oldSelectedNodes = selectedNodes.slice();
            tree.forEach(function(node) {
                if (node.expanded) {
                    oldExpandedNodes.push(node);
                } else if (!node.selected) {
                    xelib.Release(node.handle);
                }
            });
            $scope.clearSelection(true);
            $scope.buildTree();
            oldExpandedNodes.forEach((n) => reExpandNode(n));
            oldSelectedNodes.forEach((n, i, a) => reSelectNode(n, i == a.length - 1));
            freeHandles(oldExpandedNodes, oldSelectedNodes);
            console.log(`Rebuilt tree (${tree.length} nodes) in ${Date.now() - start}ms`);
        };

        $scope.toggleSort = function(column) {
            let oldReverse = $scope.sort.reverse;
            if ($scope.sort.column !== column.label) {
                $scope.sort.column = column.label;
                $scope.sort.reverse = false;
            } else {
                $scope.sort.reverse = !$scope.sort.reverse;
            }
            let reverseChanged = oldReverse != $scope.sort.reverse;
            $scope.reloadNodes(reverseChanged);
        };

        $scope.getNodeStatus = function(node) {
            let status = {
                modified: false //xelib.GetModified(handle)
            };
            if (node.element_type === 'etMainRecord') {
                status.override = xelib.IsOverride(node.handle);
                status.injected = xelib.IsInjected(node.handle);
                status.conflict = 'ctNoConflict'; //xelib.ConflictThis(node.handle);
            }
            node.status = status;
        };

        $scope.getChildrenCount = function(node) {
            if (node.element_type === 'etMainRecord') {
                let childGroup = xelib.GetElement(node.handle, 'Child Group', true);
                node.children_count = childGroup && xelib.ElementCount(childGroup);
            } else {
                node.children_count = xelib.ElementCount(node.handle);
            }
        };

        $scope.buildColumnValues = function(node) {
            node.column_values = $scope.columns.map(function(column) {
                try {
                    return column.getData(node) || "";
                } catch (x) {
                    console.log(x);
                    return "";
                }
            }).trimFalsy();
        };

        $scope.getNodeData = function(node) {
            node.element_type = xelib.ElementType(node.handle);
            if (node.element_type === 'etMainRecord') {
                node.fid = xelib.GetFormID(node.handle);
                node.is_record = true;
            }
            $scope.getNodeStatus(node);
            $scope.getChildrenCount(node);
            $scope.buildColumnValues(node);
            return node;
        };

        $scope.buildNode = function(handle, depth) {
            return {
                handle: handle,
                depth: depth + 1
            }
        };

        $scope.buildNodes = function(node) {
            let path = node.element_type === 'etMainRecord' ? 'Child Group' : '';
            let nodes = xelib.GetElements(node.handle, path, $scope.sort.column).map(function(handle) {
                return $scope.buildNode(handle, node.depth);
            });
            if ($scope.sort.reverse) nodes.reverse();
            return nodes;
        };

        $scope.expandNode = function(node) {
            let start = Date.now();
            node.expanded = true;
            let children = $scope.buildNodes(node);
            let childrenLength = children.length;
            if (childrenLength > 0) {
                node.children_count = childrenLength;
                children.forEach((child) => child.parent = node);
                let insertionIndex = tree.indexOf(node) + 1;
                tree.splice(insertionIndex, 0, ...children);
                console.log(`Built ${childrenLength} nodes in ${Date.now() - start}ms`);
            } else {
                node.children_count = 0;
                node.expanded = false;
            }
        };

        $scope.collapseNode = function(node) {
            if (node.expanded) delete node.expanded;
            let startIndex = tree.indexOf(node) + 1,
                endIndex = startIndex;
            for (; endIndex < tree.length; endIndex++) {
                let child = tree[endIndex];
                if (child.depth <= node.depth) break;
                if (child.selected) selectSingle(child, false);
            }
            let removedNodes = tree.splice(startIndex, endIndex - startIndex);
            removedNodes.forEach((node) => xelib.Release(node.handle));
            if (prevNode && prevNode.parent === node) {
                prevNode = undefined;
            }
        };

        $scope.toggleNode = function(e, node) {
            if (node.expanded) {
                $scope.collapseNode(node);
            } else {
                $scope.expandNode(node);
            }
            e.stopPropagation();
        };

        var selectedNodes = [];
        var lastRange = [];
        var prevNode;
        $scope.clearSelection = function(clearPrevNode) {
            lastRange = [];
            selectedNodes.forEach((node) => node.selected = false);
            selectedNodes = [];
            if (clearPrevNode) prevNode = undefined;
        };

        var scrollTo = function(offset) {
            treeElement.scrollTop = offset;
        };

        var nodeHeight = 20;
        var scrollToNode = function(node, center = false) {
            let index = tree.indexOf(node);
            let nodeOffset = index * nodeHeight;
            let scrollOffset = treeElement.scrollTop;
            let height = treeElement.clientHeight;
            if (center) {
                scrollTo(nodeOffset - Math.floor(height / 2));
            } else if (scrollOffset + height < nodeOffset + nodeHeight) {
                scrollTo(nodeOffset - height + nodeHeight);
            } else if (scrollOffset > nodeOffset) {
                scrollTo(nodeOffset);
            }
        };

        var selectSingle = function(node, newValue, setPrev = true, scroll = true) {
            if (!node || newValue && node.selected) return;
            if (selectedNodes.length > 0 && node.depth != prevNode.depth) return;
            node.selected = angular.isDefined(newValue) ? newValue : !node.selected;
            selectedNodes[node.selected ? 'push' : 'remove'](node);
            if (node.selected) {
                if (setPrev) prevNode = node;
                if (scroll) scrollToNode(node);
            }
        };

        var persistRange = function(start, end) {
            if (start > lastRange[0]) {
                selectSingle(tree[lastRange[0]], false, false);
            }
            if (end < lastRange[1]) {
                selectSingle(tree[lastRange[1]], false, false);
            }
        };

        var selectRange = function(n1, n2, persist = false) {
            if (n1.depth !== n2.depth) return;
            let i1 = tree.indexOf(n1),
                i2 = tree.indexOf(n2),
                startIndex = Math.min(i1, i2),
                endIndex = Math.max(i1, i2),
                targetDepth = n1.depth;
            persist && lastRange.length && persistRange(startIndex, endIndex);
            lastRange = [startIndex, endIndex];
            if (i1 < i2) {
                for (let i = i2; i >= i1; i--) {
                    let node = tree[i];
                    if (node.depth === targetDepth) {
                        selectSingle(node, true, false);
                    }
                }
            } else {
                for (let i = i2; i <= i1; i++) {
                    let node = tree[i];
                    if (node.depth === targetDepth) {
                        selectSingle(node, true, false);
                    }
                }
            }
        };

        $scope.selectNode = function(e, node) {
            lastRange = [];
            if (!e.ctrlKey) $scope.clearSelection();
            if (e.shiftKey && prevNode) {
                selectRange(node, prevNode);
            } else {
                selectSingle(node);
            }
            e.stopPropagation();
        };

        // expand node or navigate to first child when right arrow is pressed
        var handleRightArrow = function(e) {
            let node = selectedNodes.last();
            if (!node || !node.children_count) return;
            $scope.clearSelection();
            if (!node.expanded) {
                $scope.expandNode(node);
                selectSingle(node);
            } else {
                let index = tree.indexOf(node) + 1;
                selectSingle(tree[index]);
            }
        };

        // navigate to parent or collapse node when left arrow is pressed
        var handleLeftArrow = function(e) {
            let node = selectedNodes.last();
            if (!node) return;
            $scope.clearSelection();
            if (node.expanded) {
                $scope.collapseNode(node);
                selectSingle(node);
            } else {
                selectSingle(node.parent);
            }
        };

        var findNextNode = function(node, sameDepth = true) {
            let index = tree.indexOf(node);
            if (!sameDepth) {
                return tree[index + 1];
            } else {
                let targetDepth = node.depth;
                for (let i = index + 1; i < tree.length; i++) {
                    let n = tree[i];
                    if (n.depth == targetDepth) return n;
                    if (n.depth < targetDepth) return;
                }
            }
        };

        //navigate down a node when down arrow is pressed
        var handleDownArrow = function(e) {
            let node = selectedNodes.last();
            if (!node) return;
            let targetNode = findNextNode(node, e.shiftKey);
            if (!targetNode) return;
            if (e.shiftKey) {
                selectRange(targetNode, prevNode, true);
                scrollToNode(targetNode);
            } else {
                $scope.clearSelection();
                selectSingle(targetNode);
            }
        };

        var findPreviousNode = function(node, sameDepth = true) {
            let index = tree.indexOf(node);
            if (!sameDepth) {
                return tree[index - 1];
            } else {
                let targetDepth = node.depth;
                for (let i = index - 1; i >= 0; i++) {
                    let n = tree[i];
                    if (n.depth == targetDepth) return n;
                    if (n.depth < targetDepth) return;
                }
            }
        };

        //navigate up a node when up arrow is pressed
        var handleUpArrow = function(e) {
            let node = selectedNodes.last();
            if (!node) return;
            let targetNode = findPreviousNode(node, e.shiftKey);
            if (!targetNode) return;
            if (e.shiftKey) {
                selectRange(targetNode, prevNode, true);
                scrollToNode(targetNode);
            } else {
                $scope.clearSelection();
                selectSingle(targetNode);
            }
        };

        $scope.onKeyDown = function(e) {
            if (e.keyCode == 39) {
                handleRightArrow(e);
            } else if (e.keyCode == 37) {
                handleLeftArrow(e);
            } else if (e.keyCode == 40) {
                handleDownArrow(e)
            } else if (e.keyCode == 38) {
                handleUpArrow(e);
            } else {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
        };

        // initialize tree
        $scope.data = $scope.$parent.tab.data;
        $scope.buildTree();

        var treeElement;
        $timeout(function() {
            treeElement = $element[0].nextElementSibling.lastElementChild;
        }, 10);
    };

    ngapp.service('mainTreeViewFactory', function() {
        let factory = this;

        this.releaseChildren = function(node) {
            node.children.forEach(function(child) {
                if (child.children) factory.releaseChildren(child);
                xelib.Release(child.handle);
            });
        };

        this.destroy = function(view) {
            factory.releaseChildren(view.data.tree);
        };

        this.new = function() {
            return {
                templateUrl: 'partials/mainTreeView.html',
                controller: mainTreeViewController,
                class: 'main-tree-view',
                data: {
                    tabLabel: 'Tree View',
                    tree: {}
                },
                destroy: factory.destroy
            }
        };
    });

    ngapp.run(function(viewFactory, mainTreeViewFactory) {
        viewFactory.registerView('mainTreeView', mainTreeViewFactory.new);
    });
};