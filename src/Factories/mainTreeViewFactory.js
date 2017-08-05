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
                /*if (xelib.HasElement(node.handle, 'Child Group')) {
                    xelibService.withElement(node.handle, 'Child Group', function(childGroup) {
                        node.children_count = xelib.ElementCount(childGroup);
                    });
                }*/
            } else {
                node.children_count = xelib.ElementCount(node.handle);
            }
        };

        $scope.buildColumnValues = function(node) {
            node.column_values = $scope.columns.map(function(column) {
                return column.getData(node) || "";
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

        $scope.buildNodes = function(handle, depth = -1) {
            return xelib.GetElements(handle).map(function(handle) {
                return $scope.buildNode(handle, depth);
            });
        };

        $scope.expandNode = function(node) {
            node.expanded = true;
            node.children = $scope.buildNodes(node.handle, node.depth);
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

        $scope.selectNode = function(e, node, index) {
            if (e.shiftKey && $scope.prevIndex !== undefined) {
                // TODO
            } else if (e.ctrlKey) {
                if (selectedNodes.length > 0 && node.depth != selectedNodes[0].depth) {
                    return;
                }
                node.selected = !node.selected;
                if (node.selected) {
                    selectedNodes.push(node);
                } else {
                    selectedNodes.remove(node);
                }
            } else {
                $scope.clearSelection();
                node.selected = true;
                selectedNodes.push(node);
                $scope.prevIndex = index;
            }
            e.stopPropagation();
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
                name: 'mainTreeView',
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