ngapp.controller('saveModalController', function($scope, $timeout, errorService, pluginErrorService, errorCacheService) {
    // helper functions
    let setMessage = function(message, detailedMessage = '') {
        $scope.$applyAsync(() => {
            if (message) $scope.message = message;
            $scope.detailedMessage = detailedMessage;
        });
    };

    let setProgress = function(message, index) {
        $scope.detailedMessage = `${message} (${index}/${$scope.total})`;
    };

    let savePlugins = function() {
        setMessage('Saving plugins');
        $scope.pluginsToSave.forEach(function(plugin, index) {
            setProgress(plugin.filename, index);
            errorService.try(() => xelib.SaveFile(plugin.handle));
        });
    };

    let finalize = function() {
        setMessage('Finalizing xEditLib');
        xelib.Finalize();
        $scope.$emit('terminate');
    };

    let applyErrorResolutions = function() {
        setMessage('Applying error resolutions');
        $scope.pluginsToSave.forEach(function(plugin, index) {
            setProgress(plugin.filename, index);
            pluginErrorService.applyResolutions(plugin);
        });
    };

    let buildErrorCache = function() {
        let cache = [];
        $scope.pluginsToProcess.forEach(function(plugin, index) {
            setProgress(plugin.filename, index);
            if (plugin.loadedCache) return;
            cache.push(errorCacheService.createCache(plugin));
        });
        return cache;
    };

    let saveErrorCache = function() {
        setMessage('Caching errors');
        errorCacheService.saveCache(buildErrorCache());
    };

    let saveData = function() {
        $scope.total = $scope.pluginsToSave.length;
        if ($scope.total > 0) {
            isCleanMode && applyErrorResolutions();
            savePlugins();
            isCleanMode && saveErrorCache();
        }
        shouldFinalize ? finalize() : $scope.$emit('closeModal');
    };

    let getActivePlugins = function() {
        return $scope.pluginsToProcess.filter(function(plugin) {
            return plugin.active;
        });
    };

    // scope functions
    $scope.save = function() {
        $scope.saving = true;
        $scope.pluginsToSave = getActivePlugins();
        $timeout(saveData, 50);
    };

    $scope.discard = function() {
        $scope.saving = true;
        $scope.pluginsToSave = [];
        $timeout(saveData, 50);
    };

    // initialization
    let shouldFinalize = $scope.modalOptions.shouldFinalize,
        isCleanMode = $scope.$root.appMode === 'clean';
    $scope.pluginsToProcess = $scope.modalOptions.plugins;
    $scope.saving = false;
    $scope.message = 'Closing';

    // skip user interaction if there are no plugins to save
    if ($scope.pluginsToProcess.length === 0) $scope.discard();
});
