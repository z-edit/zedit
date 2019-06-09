ngapp.directive('itemsInput', function() {
    return {
        restrict: 'E',
        scope: {
            items: '='
        },
        transclude: true,
        templateUrl: 'directives/itemsInput.html',
        controller: 'itemsInputController'
    }
});

ngapp.controller('itemsInputController', function($scope) {
    $scope.removeItem = function(index) {
        $scope.items.splice(index, 1);
    };
});
