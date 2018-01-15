ngapp.controller('editMergeModalController', function($scope, mergeService, mergeStatusService) {
    // scope functions
    $scope.save = function() {
        if (!$scope.editing) $scope.modalOptions.merges.push($scope.merge);
        mergeStatusService.updateStatus($scope.merge);
        $scope.$emit('closeModal');
    };

    // initialization
    $scope.editing = $scope.modalOptions.hasOwnProperty('merge');
    $scope.merge = $scope.modalOptions.merge || mergeService.newMerge();
});
