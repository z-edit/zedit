ngapp.controller('editMergeDataController', function($scope, mergeDataService, progressService) {
    let assetArrayNames = ['archives', 'faceDataFiles', 'voiceDataFiles',
        'scriptFragments', 'stringFiles', 'translations', 'iniFiles'];

    let buildMergeData = function() {
        if ($scope.merge.hasData) return;
        progressService.showProgress({
            determinate: false,
            message: 'Detecting assets...'
        });
        mergeDataService.buildMergeData($scope.merge);
        progressService.hideProgress();
    };

    let checkNoAssets = function() {
        $scope.noAssets = assetArrayNames.reduce(function(b, key) {
            return b && $scope.merge[key].length === 0;
        }, true);
    };

    // initialization
    buildMergeData();
    checkNoAssets();
});
