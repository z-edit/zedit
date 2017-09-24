ngapp.directive('tree', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/tree.html',
        transclude: true,
        scope: {
            items: '=',
            selectedItem: '='
        },
        controller: 'treeController'
    }
});

ngapp.controller('treeController', function($scope) {
    // helper functions
    let selectItem = function(item) {
        if ($scope.selectedItem) $scope.selectedItem.selected = false;
        $scope.selectedItem = item;
        item.selected = true;
    };

    let buildNode = function(item, parentDepth = -1) {
        item.depth = parentDepth + 1;
        item.can_expand = item.children && item.children.length > 0;
    };

    let collapseNode = function(item) {
        if (!item.expanded) return;
        delete item.expanded;
        let startIndex = $scope.items.indexOf(item) + 1,
            endIndex = startIndex;
        for (; endIndex < $scope.items.length; endIndex++) {
            let child = $scope.items[endIndex];
            if (child.depth <= item.depth) break;
        }
        $scope.items.splice(startIndex, endIndex - startIndex);
    };

    let expandNode = function(item) {
        if (item.expanded) return;
        let insertionIndex = $scope.items.indexOf(item) + 1;
        item.children.forEach((child) => buildNode(child, item.depth));
        $scope.items.splice(insertionIndex, 0, ...item.children);
        item.expanded = true;
    };

    // scope functions
    $scope.onTreeItemClick = function(e, item) {
        selectItem(item);
        e.stopPropagation();
    };

    $scope.toggleExpanded = function(e, item) {
        (item.expanded ? collapseNode : expandNode)(item);
        e.stopPropagation();
    };

    // event handlers
    $scope.$on('expandTreeNode', function(e, item) {
        expandNode(item);
    });

    $scope.$on('collapseTree', function() {
        for (let i = $scope.items.length - 1; i >= 0; i--) {
            let item = $scope.items[i];
            if (item.expanded) collapseNode(item);
        }
    });

    // initialization
    $scope.items.forEach((item) => buildNode(item));
});
