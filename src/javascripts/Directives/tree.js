ngapp.directive('tree', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/tree.html',
        scope: {
            items: '=',
            selectedItem: '=',
            labelKey: '='
        },
        controller: 'treeController'
    }
});

ngapp.controller('treeController', function($scope) {
    $scope.onTreeItemClick = function(e, item) {
        $scope.$emit('treeItemClick', item);
        e.stopPropagation();
    };

    $scope.toggleExpanded = function(e, item) {
        item.expanded = !item.expanded;
        e.stopPropagation();
    };
});