ngapp.directive('elementRuleNode', function() {
    return {
        restrict: 'E',
        scope: {
            element: '=?'
        },
        templateUrl: 'directives/elementRuleNode.html',
        controller: 'elementRuleNodeController'
    };
});

ngapp.controller('elementRuleNodeController', function($scope) {
    angular.inherit($scope, 'element');

    // scope functions
    $scope.toggleExpansion = function() {
        $scope.element.expanded = !$scope.element.expanded;
    };

    $scope.select = function(e) {
        $scope.$emit('clearSelection');
        $scope.element.selected = true;
        e.stopPropagation();
    };
});