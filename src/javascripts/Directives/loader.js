ngapp.directive('loader', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/loader.html',
        controller: 'loaderController',
        scope: {
            message: '=',
            spinnerOpts: '=',
            canCancel: '=?'
        }
    }
});

ngapp.controller('loaderController', function ($scope, $rootScope) {
    $scope.cancel = function() {
        $scope.message = "Cancelling...";
        $rootScope.$broadcast('cancel');
    };
});