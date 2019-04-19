ngapp.controller('editPatchPluginsController', function($scope, $rootScope,  loadOrderService) {
    // TODO: have the load order here behave like it does in the load order modal!
    // When a user disables a plugin, disable the plugins that require it

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
            active: pluginInPatch(plugin.filename)
        }));
    };

    let updateExclusions = function() {
        $scope.patch.pluginExclusions = $scope.plugins
            .filter(plugin => !plugin.active)
            .mapOnKey('filename');
    };

    let updateInclusions = function() {
        $scope.patch.pluginInclusions = $scope.plugins
            .filter(plugin => plugin.active)
            .mapOnKey('filename');
    };

    let updatePatch = function() {
        let useExclusions = $scope.patch.patchType === 'Full load order';
        useExclusions ? updateExclusions() : updateInclusions();
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
        updatePatch();
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
    });
    loadOrderService.updateIndexes($scope.plugins);
});
