ngapp.directive('apiItems', function() {
    return {
        restrict: 'E',
        scope: {
            api: '@',
            namespace: '@'
        },
        templateUrl: 'directives/apiItems.html',
        controller: 'apiItemsController'
    }
});

ngapp.controller('apiItemsController', function($scope) {
    let path = `docs/development/apis/${$scope.api}/${$scope.namespace}.json`;
    $scope.items = fh.loadJsonFile(path);
});