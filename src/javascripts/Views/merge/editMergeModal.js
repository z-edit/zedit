ngapp.controller('editMergeModalController', function($scope, mergeService, mergeDataService, progressService) {
    // initialization
    $scope.editing = $scope.modalOptions.hasOwnProperty('merge');
    $scope.merge = $scope.modalOptions.merge || mergeService.newMerge();

    // scope functions
    $scope.createMerge = function() {
        $scope.modalOptions.merges.push($scope.merge);
        $scope.$emit('closeModal');
    };

    $scope.buildMergeData = function() {
        if ($scope.merge.hasData) return;
        progressService.showProgress({
            determinate: false,
            message: 'Detecting assets...'
        });
        mergeDataService.buildMergeData($scope.merge);
        progressService.hideProgress();
    };
});