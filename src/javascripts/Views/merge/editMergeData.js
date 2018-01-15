ngapp.controller('editMergeDataController', function($scope, mergeDataService, progressService) {
    let assetArrayNames = ['archives', 'faceDataFiles', 'voiceDataFiles',
        'scriptFragments', 'stringFiles', 'translations', 'iniFiles'];

    // helper functions
    let buildMergeData = function() {
        if ($scope.merge.hasData) return;
        progressService.showProgress({ message: 'Detecting assets...' });
        mergeDataService.buildMergeData($scope.merge);
        progressService.hideProgress();
    };

    let checkNoAssets = function() {
        $scope.noAssets = assetArrayNames.reduce(function(b, key) {
            return b && $scope.merge[key].length === 0;
        }, true);
    };

    // scope functions
    $scope.setDataFolder = function(plugin) {
        let filename = plugin.filename;
        if (!fh.jetpack.exists(`${plugin.dataFolder}\\${filename}`)) {
            plugin.dataFolder = mergeDataService.getPluginDataFolder(filename);
            return;
        }
        mergeDataService.setPluginDataFolder(filename, plugin.dataFolder);
    };

    $scope.browseDataFolder = function(plugin) {
        let title = `Select data folder for ${plugin.filename}`,
            newPath = fh.selectDirectory(title, plugin.dataFolder);
        if (!newPath) return;
        plugin.dataFolder = newPath;
        $scope.setDataFolder(plugin);
    };

    // initialization
    buildMergeData();
    checkNoAssets();
});
