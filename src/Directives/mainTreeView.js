export default function(ngapp, xelib) {
    ngapp.directive('mainTreeView', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/mainTreeView.html',
            controller: 'mainTreeViewController',
            scope: {
                data: '='
            }
        }
    });

    ngapp.controller('mainTreeViewController', function($scope, xelibService) {
        // TODO: Load this from disk
        $scope.columns = [
            {
                label: "FormID",
                getData: function(node) {
                    switch (node.element_type) {
                        case 'etFile':
                            return xelib.DisplayName(node.handle);
                        case 'etGroupRecord':
                            // TODO: include signature as well based on setting
                            return xelib.DisplayName(node.handle);
                        case 'etMainRecord':
                            return xelibService.HexFormID(node.handle);
                    }
                }
            },
            {
                label: "EditorID",
                getData: function(node) {
                    if (node.element_type === 'etMainRecord') {
                        return xelib.EditorID(node.handle);
                    }
                }
            },
            {
                label: "Name",
                getData: function(node) {
                    if (node.element_type === 'etMainRecord') {
                        return xelib.FullName(node.handle);
                    }
                }
            }
        ];

        $scope.getNodeStatus = function(node) {
            let status = {
                modified: false //xelib.GetModified(handle)
            };
            if (node.elementType === 'etMainRecord') {
                status.override = xelib.IsOverride(node.handle);
                status.injected = xelib.IsInjected(node.handle);
                status.conflict = 'ctNoConflict'; //xelib.ConflictThis(node.handle);
            }
            node.status = status;
        };

        $scope.getChildrenCount = function(node) {
            if (node.elementType === 'etMainRecord') {
                if (xelib.HasElement(node.handle, 'Child Group')) {
                    xelib.withElement(node.handle, 'Child Group', function(childGroup) {
                        node.children_count = xelib.ElementCount(childGroup);
                    });
                } else {
                    node.children_count = 0;
                }
            } else {
                node.children_count = xelib.ElementCount(node.handle);
            }
        };

        $scope.buildColumnValues = function(node) {
            node.column_values = $scope.columns.map(function(column) {
                return column.getData(node) || "";
            });
        };

        $scope.buildNode = function(handle) {
            let node = {
                handle: handle,
                type: xelib.ElementType(handle)
            };
            $scope.getNodeStatus(node);
            $scope.getChildrenCount(node);
            $scope.buildColumnValues(node);
            return node;
        };

        $scope.buildNodes = function(handle) {
            return xelib.GetElements(handle).map(function(handle) {
                return $scope.buildNode(handle);
            });
        };

        $scope.expandNode = function(node) {
            node.expanded = true;
            node.children = $scope.buildNodes(node.handle);
            if (!node.children.length) {
                node.children_count = 0;
                $scope.collapseNode(node);
            }
        };

        $scope.collapseNode = function(node) {
            if (node.expanded) delete node.expanded;
            if (node.children) {
                $scope.releaseChildren(node);
                delete node.children;
            }
        };

        // initialize tree
        $scope.data.tree = $scope.buildNodes(0);
    });
};