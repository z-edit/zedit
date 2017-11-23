ngapp.directive('tabs', function() {
    return {
        restrict: 'E',
        scope: {
            tabs: '=?'
        },
        controller: 'tabsController'
    }
});

ngapp.controller('tabsController', function($scope, tabService) {
    Object.defaults($scope, {
        tabs: $scope.$parent.tabs
    });

    tabService.buildFunctions($scope);
});
