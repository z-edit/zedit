ngapp.controller('editMergeModalController', function($scope, mergeService) {
    // scope functions
    $scope.save = function() {
        if (!$scope.editing) $scope.modalOptions.merges.push($scope.merge);
        mergeService.updateStatus($scope.merge);
        $scope.$emit('closeModal');
    };

    // initialization
    $scope.editing = $scope.modalOptions.hasOwnProperty('merge');
    $scope.merge = $scope.modalOptions.merge || mergeService.newMerge();
});
