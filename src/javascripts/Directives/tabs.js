ngapp.directive('tabs', function() {
    return {
        restrict: 'E',
        scope: {
            source: '@'
        },
        controller: 'tabsController'
    }
});

ngapp.controller('tabsController', function($scope, tabService, tabsFactory) {
    $scope.tabs = tabsFactory[$scope.source];
    tabService.buildFunctions($scope);
});
