ngapp.controller('editPatchPluginsController', function($scope, $rootScope,  loadOrderService, gameService) {
    let {isBethesdaPlugin} = gameService;

    // helper functions
    let activeFilter = item => item && item.active || item.required;

    let pluginInPatch = function(filename) {
        let useExclusions = $scope.patch.patchType === 'Full load order';
        return useExclusions ?
             !$scope.patch.pluginExclusions.includes(filename) :
            $scope.patch.pluginInclusions.includes(filename);
    };

    let buildPlugins = function() {
        $scope.plugins = $rootScope.loadOrder.map(plugin => ({
            filename: plugin.filename,
            masterNames: plugin.masterNames.slice(),
            active: pluginInPatch(plugin.filename),
            isBethesdaPlugin: isBethesdaPlugin(plugin.filename)
        }));
    };

    let patchPluginMap = function(plugin) {
        return {
            filename: plugin.filename,
            hash: plugin.hash
        }
    };

    let updatePatchPlugins = function() {
        $scope.patch.plugins = $scope.plugins
            .filterOnKey('active').map(patchPluginMap);
        $scope.patch.loadOrder = $scope.plugins
            .filter(p => p.required || p.active)
            .mapOnKey('filename');
    };

    let updateWarningPlugins = function() {
        let {filename} = $scope.patch;
        $scope.patch.warningPlugins = $scope.plugins
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
        for (let i = $scope.plugins.length - 1; i >= 0; i--) {
            let item = $scope.plugins[i];
            if (item.disabled) continue;
            item.title = '';
            delete item.index;
            loadOrderService.updateRequired(item);
            loadOrderService.updateWarnings(item);
        }
        loadOrderService.updateIndexes($scope.plugins);
        updatePatchPlugins();
        updateWarningPlugins();
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    $scope.$on('itemsReordered', function(e) {
        loadOrderService.updateIndexes($scope.plugins);
        updatePatchPlugins();
        updateWarningPlugins();
        e.stopPropagation();
    });

    // initialization
    buildPlugins();
    loadOrderService.activateMode = false;
    loadOrderService.init($scope.plugins, activeFilter);
    $scope.plugins.forEach(plugin => {
        loadOrderService.updateRequired(plugin);
        loadOrderService.updateWarnings(plugin);
    });
    loadOrderService.updateIndexes($scope.plugins);
});
