export default function(ngapp, xelib) {
    var mainTreeViewController = function($scope, xelibService, mainTreeViewFactory) {
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

        $scope.sort = {
            label: 'FormID',
            index: 0,
            reverse: false
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
                node.children_count = 0;
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

        $scope.sortNodes = function(nodes) {
            nodes.sort(function(a, b) {
                if (a.fid === 0) return -1;
                if (b.fid === 0) return 1;
                let valueA = a.column_values[$scope.sort.index];
                let valueB = b.column_values[$scope.sort.index];
                if (valueA < valueB) return -1;
                if (valueA > valueB) return 1;
                return 0;
            });
            if ($scope.sort.reverse) nodes.reverse();
        };

        $scope.buildNodes = function(node) {
            let path = node.element_type === 'etMainRecord' ? 'Child Group' : '';
            return xelib.GetElements(node.handle, path, $scope.sort.label).map(function(handle) {
                return $scope.buildNode(handle, node.depth);
            });
        };

        $scope.expandNode = function(node) {
            let start = Date.now();
            node.expanded = true;
            let children = $scope.buildNodes(node.handle, node.depth);
            if (children.length > 0) {
                children.forEach((child) => child.parent = node);
                let insertionIndex = $scope.data.tree.indexOf(node) + 1;
                $scope.data.tree.splice(insertionIndex, 0, ...children);
                console.log(`Built ${node.children_count} nodes in ${Date.now() - start}ms`);
            } else {
                node.children_count = 0;
                node.expanded = false;
            }
        };

        $scope.collapseNode = function(node) {
            if (node.expanded) delete node.expanded;
            let startIndex = $scope.data.tree.indexOf(node) + 1,
                endIndex = startIndex;
            for (; endIndex < $scope.data.tree.length; endIndex++) {
                let child = $scope.data.tree[endIndex];
                if (child.depth <= node.depth) break;
                if (child.selected) {
                    child.selected = false;
                    selectedNodes.remove(child);
                }
            }
            let removedNodes = $scope.data.tree.splice(startIndex, endIndex - startIndex);
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
        var prevNode;
        $scope.clearSelection = function(clearPrevNode) {
            selectedNodes.forEach((node) => node.selected = false);
            selectedNodes = [];
            if (clearPrevNode) prevNode = undefined;
        };

        var selectRange = function(n1, n2) {
            if (n1.depth !== n2.depth || n1 === n2) return;
            let i1 = $scope.data.tree.indexOf(n1),
                i2 = $scope.data.tree.indexOf(n2),
                startIndex = Math.min(i1, i2),
                endIndex = Math.max(i1, i2),
                targetDepth = n1.depth;
            for (let i = startIndex; i <= endIndex; i++) {
                let node = $scope.data.tree[i];
                if (node.depth === targetDepth && !node.selected) {
                    node.selected = true;
                    selectedNodes.push(node);
                }
            }
        };

        var selectSingle = function(node) {
            if (selectedNodes.length > 0 && node.depth != prevNode.depth) return;
            node.selected = !node.selected;
            selectedNodes[node.selected ? 'push' : 'remove'](node);
        };

        $scope.selectNode = function(e, node) {
            if (!e.ctrlKey) $scope.clearSelection();
            if (e.shiftKey && prevNode) {
                selectRange(node, prevNode);
            } else {
                prevNode = node;
                selectSingle(node);
            }
            e.stopPropagation();
        };

        // expand node or navigate to first child when right arrow is pressed
        var handleRightArrow = function(e) {
            let node = selectedNodes.last();
            if (!node || !node.children_count) return;
            if (!node.expanded) {
                $scope.clearSelection();
                $scope.expandNode(node);
                node.selected = true;
                selectedNodes.push(node);
            } else {
                let index = $scope.data.tree.indexOf(node) + 1;
                $scope.selectNode(e, $scope.data.tree[index]);
            }
        };

        // navigate to parent or collapse node when left arrow is pressed
        var handleLeftArrow = function(e) {
            let node = selectedNodes.last();
            if (!node) return;
            if (!e.shiftKey) $scope.clearSelection();
            if (node.expanded) {
                $scope.collapseNode(node);
                prevNode = node;
                selectSingle(node);
            } else {
                node = node.parent;
                prevNode = node;
                selectSingle(node);
            }
        };

        //navigate down a node when down arrow is pressed
        var handleDownArrow = function(e) {
            let node = selectedNodes.last();
            if (!node) return;
            let index = $scope.data.tree.indexOf(node) + 1;
            let targetNode = $scope.data.tree[index];
            if (!targetNode) return;
            if (e.shiftKey) {
                selectRange(targetNode, prevNode);
            } else {
                $scope.clearSelection();
                selectSingle(targetNode);
            }
        };

        //navigate up a node when up arrow is pressed
        var handleUpArrow = function(e) {
            let node = selectedNodes.last();
            if (!node) return;
            let index = $scope.data.tree.indexOf(node) - 1;
            let targetNode = $scope.data.tree[index];
            if (!targetNode) return;
            if (e.shiftKey) {
                selectRange(prevNode, targetNode);
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
        $scope.data.tree = xelib.GetElements(0, '', $scope.sort.label).map(function(handle) {
            return $scope.buildNode(handle, -1);
        });
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