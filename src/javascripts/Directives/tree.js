ngapp.directive('tree', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/tree.html',
        scope: {
            items: '=',
            selectedItem: '='
        },
        controller: 'treeController'
    }
});

ngapp.controller('treeController', function($scope) {
    let selectItem = function(item) {
        if ($scope.selectedItem) $scope.selectedItem.selected = false;
        $scope.selectedItem = item;
        item.selected = true;
    };

    $scope.onTreeItemClick = function(e, item) {
        selectItem(item);
        e.stopPropagation();
    };

    $scope.toggleExpanded = function(e, item) {
        item.expanded = !item.expanded;
        e.stopPropagation();
    };
});