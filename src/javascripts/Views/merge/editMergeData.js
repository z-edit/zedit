ngapp.controller('editMergeDataController', function($scope, mergeDataService, progressService) {
    let buildMergeData = function() {
        if ($scope.merge.hasData) return;
        progressService.showProgress({
            determinate: false,
            message: 'Detecting assets...'
        });
        mergeDataService.buildMergeData($scope.merge);
        progressService.hideProgress();
    };

    // initialization
    buildMergeData();
});
