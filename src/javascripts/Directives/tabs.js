ngapp.directive('tabs', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/tabs.html',
        controller: 'tabsController'
    }
});

ngapp.controller('tabsController', function($scope, $attrs, tabService, tabsFactory) {
    $scope.tabs = tabsFactory[$attrs.source];
    tabService.buildFunctions($scope);
});
