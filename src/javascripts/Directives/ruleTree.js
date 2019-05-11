ngapp.directive('ruleTree', function() {
    return {
        restrict: 'E',
        scope: {
            tree: '=?'
        },
        templateUrl: 'directives/ruleTree.html',
        controller: 'ruleTreeController'
    }
});

ngapp.controller('ruleTreeController', function($scope, contextMenuFactory, contextMenuService) {
    $scope.contextMenuItems = contextMenuFactory.ruleTreeItems;

    $scope.showContextMenu = function(e) {
        if ($scope.focusedIndex === 0) return;
        contextMenuService.showContextMenu($scope, e);
    };
});