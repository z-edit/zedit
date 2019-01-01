ngapp.controller('cleanSaveModalController', function($scope, $timeout, saveModalService, pluginErrorService, errorCacheService) {
    // inherited functions
    saveModalService.buildFunctions($scope);

    // helper functions
    let applyErrorResolutions = function() {
        $scope.setMessage('Applying error resolutions');
        $scope.pluginsToSave.forEach(function(plugin, index) {
            $scope.setProgress(plugin.filename, index);
            pluginErrorService.applyResolutions(plugin);
        });
    };

    let buildErrorCache = function() {
        let cache = [];
        $scope.pluginsToProcess.forEach(function(plugin, index) {
            $scope.setProgress(plugin.filename, index);
            if (plugin.loadedCache) return;
            cache.push(errorCacheService.createCache(plugin));
        });
        return cache;
    };

    let saveErrorCache = function() {
        $scope.setMessage('Caching errors');
        errorCacheService.saveCache(buildErrorCache());
    };

    let saveData = function() {
        $scope.total = $scope.pluginsToSave.length;
        if ($scope.total > 0) {
            applyErrorResolutions();
            $scope.savePlugins();
        }
        saveErrorCache();
        shouldFinalize ? $scope.finalize() : $scope.$emit('closeModal');
    };

    // scope functions
    $scope.save = function() {
        $scope.saving = true;
        $scope.pluginsToSave = $scope.getActivePlugins();
        $timeout(saveData, 50);
    };

    $scope.discard = function() {
        $scope.saving = true;
        $scope.pluginsToSave = [];
        $timeout(saveData, 50);
    };

    // initialization
    let shouldFinalize = $scope.modalOptions.shouldFinalize;
    $scope.pluginsToProcess = $scope.modalOptions.plugins;
    $scope.saving = false;
    $scope.message = 'Closing';

    // skip user interaction if there are no plugins to save
    if ($scope.pluginsToProcess.length === 0) $scope.discard();
});
