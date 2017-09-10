ngapp.controller('progressModalController', function($scope, modalService) {
    // initialization
    $scope.progress = $scope.modalOptions.progress;

    // inherited functions
    modalService.buildUnfocusModalFunction($scope);

    // scope functions
    $scope.toggleExpanded = () => $scope.expanded = !$scope.expanded;
    $scope.onLogScroll = function(e) {
        // TODO: stick to bottom
    };
});