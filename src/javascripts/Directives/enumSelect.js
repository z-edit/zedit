ngapp.directive('enumSelect', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            handle: '=?'
        },
        templateUrl: 'directives/enumSelect.html',
        controller: 'enumSelectController'
    }
});

ngapp.controller('enumSelectController', function($scope) {
    $scope.enumOptions = xelib.GetEnumOptions($scope.handle);
});
