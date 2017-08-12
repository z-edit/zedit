ngapp.directive('loadingModal', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/loadingModal.html',
        controller: 'loadingModalController',
        scope: false
    }
});

ngapp.controller('loadingModalController', function ($scope, $rootScope) {
    $scope.cancel = function() {
        $scope.loadingMessage = "Cancelling...";
        $rootScope.$broadcast('cancel');
    };
});
