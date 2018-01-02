ngapp.controller('editMergePluginsController', function($scope, $rootScope, mergeDataService, loadOrderService) {
    // helper functions
    let activeFilter = (item) => { return item.active || item.required };

    let buildPlugins = function() {
        $scope.plugins = $rootScope.loadOrder.map(function(item) {
            return {
                filename: item.filename,
                masterNames: item.masterNames,
                active: $scope.merge.plugins.includes(item.filename)
            }
        });
    };

    let updateMergePlugins = function() {
        $scope.merge.plugins = $scope.plugins
            .filterOnKey('active').mapOnKey('filename');
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