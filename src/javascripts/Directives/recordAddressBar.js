ngapp.directive('recordAddressBar', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/recordAddressBar.html',
        controller: 'recordAddressBarController'
    }
});

ngapp.controller('recordAddressBarController', function($scope) {
    $scope.canGoBack = false;
    $scope.canGoForward = false;
    $scope.history = [];

    $scope.back = function() {

    };

    $scope.forward = function() {

    };
});