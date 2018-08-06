ngapp.controller('editMergePluginsController', function($scope, $rootScope, mergeDataService, loadOrderService) {
    // helper functions
    let activeFilter = (item) => { return item.active || item.required };

    let getPluginObject = function(plugins, filename) {
        return plugins && plugins.findByKey('filename', filename);
    };

    let buildPlugins = function() {
        $scope.plugins = $rootScope.loadOrder.map(function(plugin) {
            let filename = plugin.filename;
            return {
                filename: filename,
                masterNames: plugin.masterNames,
                active: !!getPluginObject($scope.merge.plugins, filename),
                dataFolder: mergeDataService.getPluginDataFolder(filename)
            }
        });
    };

    let mergePluginMap = function(plugin) {
        let obj = getPluginObject($scope.merge.plugins, plugin.filename);
        return {
            filename: plugin.filename,
            hash: obj && obj.hash,
            dataFolder: plugin.dataFolder
        }
    };

    let updateMergePlugins = function() {
        $scope.merge.plugins = $scope.plugins
            .filterOnKey('active').map(mergePluginMap);
    };

    // scope functions
    $scope.itemToggled = function(item) {
        mergeDataService.clearMergeData($scope.merge);
        item.masters.forEach(loadOrderService.updateRequired);
        item.requiredBy.forEach(loadOrderService.updateWarnings);
        loadOrderService.updateIndexes($scope.plugins);
        updateMergePlugins();
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    $scope.$on('itemsReordered', function(e) {
        loadOrderService.updateIndexes($scope.plugins);
        updateMergePlugins();
        e.stopPropagation();
    });

    // initialization
    buildPlugins();
    loadOrderService.activateMode = false;
    loadOrderService.init($scope.plugins, activeFilter);
    $scope.plugins.forEach(loadOrderService.updateWarnings);
});
