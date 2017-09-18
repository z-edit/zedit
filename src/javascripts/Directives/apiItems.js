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
    let basePath = 'app/docs/development/apis',
        path = `${basePath}/${$scope.api}/${$scope.namespace}.json`,
        items = fh.loadJsonFile(path);
    items.forEach(function(item) {
        if (!item.type) item.type = 'function';
    });
    $scope.items = items;
});