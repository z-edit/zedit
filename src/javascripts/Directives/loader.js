ngapp.directive('loader', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/loader.html',
        controller: 'loaderController',
        scope: false
    }
});

ngapp.controller('loaderController', function ($scope, $rootScope) {
    $scope.cancel = function() {
        $scope.loadingMessage = "Cancelling...";
        $rootScope.$broadcast('cancel');
    };
});
