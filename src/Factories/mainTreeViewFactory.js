export default function(ngapp, xelib) {
    var mainTreeViewController = function($scope, xelibService, mainTreeViewFactory) {
        // TODO: Load this from disk
        $scope.columns = [
            {
                label: "FormID",
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
                width: '150px',
                getData: function(node) {
                    if (node.element_type === 'etMainRecord' && node.fid > 0) {
                        return xelib.EditorID(node.handle);
                    }
                }
            },
            {
                label: "Name",
                getData: function(node) {
                    if (node.element_type === 'etMainRecord' && node.fid > 0) {
                        if (xelib.HasElement(node.handle, 'FULL')) {
                            return xelib.FullName(node.handle);
                        }
                    }
                }
            }
        ];

        $scope.sort = {
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

        $scope.buildNode = function(handle, depth) {
            let node = {
                handle: handle,
                element_type: xelib.ElementType(handle),
                depth: depth + 1
            };
            if (node.element_type === 'etMainRecord') {
                node.fid = xelib.GetFormID(node.handle);
                node.is_record = true;
            }
            $scope.getNodeStatus(node);
            $scope.getChildrenCount(node);
            $scope.buildColumnValues(node);
            return node;
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
            nodes.forEach(function(node, index) {
                node.index = index;
            });
            if ($scope.sort.reverse) nodes.reverse();
        };

        $scope.buildNodes = function(handle, depth = -1) {
            let nodes = xelib.GetElements(handle).map(function(handle) {
                return $scope.buildNode(handle, depth);
            });
            $scope.sortNodes(nodes);
            return nodes;
        };

        $scope.expandNode = function(node) {
            node.expanded = true;
            node.children = $scope.buildNodes(node.handle, node.depth);
            node.children.forEach(function(child) {
                child.parent = node;
            });
            if (!node.children.length) {
                node.children_count = 0;
                $scope.collapseNode(node);
            }
        };

        $scope.collapseNode = function(node) {
            if (node.expanded) delete node.expanded;
            if (node.children) {
                mainTreeViewFactory.releaseChildren(node);
                delete node.children;
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
        $scope.clearSelection = function() {
            selectedNodes.forEach(function(node) {
                node.selected = false;
            });
            selectedNodes = [];
        };

        var prevIndex;
        $scope.selectNode = function(e, node) {
            if (e && e.shiftKey && prevIndex !== undefined) {
                // TODO
            } else if (e && e.ctrlKey) {
                if (selectedNodes.length > 0 && node.depth != selectedNodes[0].depth) {
                    return;
                }
                node.selected = !node.selected;
                prevIndex = node.index;
                if (node.selected) {
                    selectedNodes.push(node);
                } else {
                    selectedNodes.remove(node);
                }
            } else {
                $scope.clearSelection();
                node.selected = true;
                selectedNodes.push(node);
                prevIndex = node.index;
            }
            e && e.stopPropagation();
        };

        // expand node or navigate to first child when right arrow is pressed
        var handleRightArrow = function() {
            let node = selectedNodes.last();
            if (!node || !node.children_count) return;
            if (!node.expanded) {
                $scope.clearSelection();
                $scope.expandNode(node);
                node.selected = true;
                selectedNodes.push(node);
            } else {
                $scope.selectNode(null, node.children[0]);
            }
        };

        // navigate to parent or collapse node when left arrow is pressed
        var handleLeftArrow = function() {
            let node = selectedNodes.last();
            if (!node) return;
            if (node.expanded) {
                $scope.clearSelection();
                $scope.collapseNode(node);
                node.selected = true;
                selectedNodes.push(node);
            } else {
                node = node.parent;
                $scope.selectNode(null, node, node.index);
            }
        };

        var selectNextNode = function(node) {
            let nextIndex = node.index + 1;
            let collection = node.parent && node.parent.children || $scope.data.tree;
            if (nextIndex < collection.length) {
                $scope.selectNode(null, collection[nextIndex]);
            } else if (node.parent) {
                selectNextNode(node.parent);
            }
        };

        //navigate down a node or to first child when down arrow is pressed
        var handleDownArrow = function() {
            let node = selectedNodes.last();
            if (!node) return;
            if (node.expanded) {
                $scope.selectNode(null, node.children[0]);
            } else {
                selectNextNode(node);
            }
        };

        var selectPreviousNode = function(node) {
            let prevIndex = node.index - 1;
            let collection = node.parent && node.parent.children || $scope.data.tree;
            if (prevIndex > -1) {
                let prevNode = collection[prevIndex];
                while (prevNode.expanded) {
                    prevNode = prevNode.children.last();
                }
                $scope.selectNode(null, prevNode);
            } else if (node.parent) {
                $scope.selectNode(null, node.parent);
            }
        };

        //navigate down a node or to first child when down arrow is pressed
        var handleUpArrow = function() {
            let node = selectedNodes.last();
            if (!node) return;
            selectPreviousNode(node);
        };

        $scope.onKeyDown = function(e) {
            if (e.keyCode == 39) {
                handleRightArrow();
            } else if (e.keyCode == 37) {
                handleLeftArrow();
            } else if (e.keyCode == 40) {
                handleDownArrow()
            } else if (e.keyCode == 38) {
                handleUpArrow();
            } else {
                return;
            }
            e.stopPropagation();
            e.preventDefault();
        };

        // initialize tree
        $scope.data = $scope.$parent.tab.data;
        $scope.data.tree = $scope.buildNodes(0);
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