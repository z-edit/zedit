ngapp.directive('progressModal', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/progressModal.html',
        controller: 'progressModalController'
    }
});

ngapp.controller('progressModalController', function($scope, modalService) {
    // inherited functions
    modalService.buildUnfocusModalFunction($scope);

    // scope functions
    $scope.toggleExpanded = () => $scope.expanded = !$scope.expanded;
});