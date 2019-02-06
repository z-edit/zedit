ngapp.controller('editMergePluginsController', function($scope, $rootScope, mergeDataService, loadOrderService, gameService) {
    let {isBethesdaPlugin} = gameService,
        {clearMergeData, getPluginDataFolder} = mergeDataService,
        {updateWarnings, updateRequired, updateIndexes} = loadOrderService;

    // helper functions
    let activeFilter = item => item && item.active || item.required;

    let getPluginObject = function(filename) {
        if (!$scope.merge.plugins) return;
        return $scope.merge.plugins.findByKey('filename', filename);
    };

    let buildPlugins = function() {
        $scope.plugins = $rootScope.loadOrder.map(plugin => ({
            filename: plugin.filename,
            masterNames: plugin.masterNames.slice(),
            active: !!getPluginObject(plugin.filename),
            isBethesdaPlugin: isBethesdaPlugin(plugin.filename),
            dataFolder: getPluginDataFolder(plugin.filename)
        }));
    };

    let mergePluginMap = function(plugin) {
        let obj = getPluginObject(plugin.filename);
        return {
            filename: plugin.filename,
            hash: obj && obj.hash,
            dataFolder: plugin.dataFolder
        }
    };

    let updateMergePlugins = function() {
        $scope.merge.plugins = $scope.plugins
            .filterOnKey('active').map(mergePluginMap);
        $scope.merge.loadOrder = $scope.plugins
            .filter(p => p.required || p.active)
            .mapOnKey('filename');
    };

    let updateWarningPlugins = function() {
        let {filename} = $scope.merge;
        $scope.merge.warningPlugins = $scope.plugins
            .filter(p => p.warn && !p.active && p.filename !== filename)
            .mapOnKey('filename');
    };

    // filtering
    $scope.loadOrderFilters = [{
        label: 'Search',
        modes: { select: true, jump: true },
        filter: (item, str) => item.filename.contains(str, true)
    }];

    // scope functions
    $scope.itemToggled = function() {
        clearMergeData($scope.merge);
        for (let i = $scope.plugins.length - 1; i >= 0; i--) {
            let item = $scope.plugins[i];
            if (item.disabled) continue;
            item.title = '';
            delete item.index;
            updateRequired(item);
            updateWarnings(item);
        }
        updateIndexes($scope.plugins);
        updateMergePlugins();
        updateWarningPlugins();
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    $scope.$on('itemsReordered', function(e) {
        updateIndexes($scope.plugins);
        updateMergePlugins();
        updateWarningPlugins();
        e.stopPropagation();
    });

    // initialization
    buildPlugins();
    loadOrderService.activateMode = false;
    loadOrderService.init($scope.plugins, activeFilter);
    $scope.plugins.forEach(plugin => {
        updateRequired(plugin);
        updateWarnings(plugin);
    });
    updateIndexes($scope.plugins);
});
