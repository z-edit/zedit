ngapp.directive('tabs', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/tabs.html',
        controller: 'tabsController'
    }
});

ngapp.controller('tabsController', function($scope, $attrs, tabInterface, tabsFactory) {
    $scope.tabs = tabsFactory[$attrs.source];
    tabInterface($scope);
});
