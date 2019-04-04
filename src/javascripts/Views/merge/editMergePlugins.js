ngapp.controller('editMergePluginsController', function($scope, $rootScope, mergeDataService, loadOrderService, gameService) {
    let {isBethesdaPlugin} = gameService;

    // helper functions
    let activeFilter = item => item && item.active || item.required;

    let getPluginObject = function(plugins, filename) {
        return plugins && plugins.findByKey('filename', filename);
    };

    let buildPlugins = function() {
        $scope.plugins = $rootScope.loadOrder.map(plugin => ({
            filename: plugin.filename,
            masterNames: plugin.masterNames.slice(),
            active: !!getPluginObject($scope.merge.plugins, plugin.filename),
            dataFolder: mergeDataService.getPluginDataFolder(plugin.filename)
        }));
    };

    let mergePluginMap = function(plugin) {
        let obj = getPluginObject($scope.merge.plugins, plugin.filename),
            pluginPath = fh.path(plugin.dataFolder, plugin.filename);
        return {
            filename: plugin.filename,
            hash: obj ? obj.hash : fh.getMd5Hash(pluginPath),
            dataFolder: plugin.dataFolder
        }
    };

    let updateMergePlugins = function() {
        $scope.merge.plugins = $scope.plugins
            .filterOnKey('active').map(mergePluginMap);
    };

    let updateMergeLoadOrder = function() {
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
        mergeDataService.clearMergeData($scope.merge);
        for (let i = $scope.plugins.length - 1; i >= 0; i--) {
            let item = $scope.plugins[i];
            if (item.disabled) continue;
            item.title = '';
            delete item.index;
            loadOrderService.updateRequired(item);
            loadOrderService.updateWarnings(item);
        }
        updateMergePlugins();
        updateWarningPlugins();
        updateMergeLoadOrder();
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    // initialization
    buildPlugins();
    loadOrderService.activateMode = false;
    loadOrderService.init($scope.plugins, activeFilter);
    $scope.plugins.forEach(plugin => {
        loadOrderService.updateRequired(plugin);
        loadOrderService.updateWarnings(plugin);
        plugin.isBethesdaPlugin = isBethesdaPlugin(plugin.filename);
    });
});
