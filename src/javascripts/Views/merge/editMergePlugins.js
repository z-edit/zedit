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

    $scope.itemToggled = function(item) {
        item.masters.forEach(loadOrderService.updateRequired);
        loadOrderService.updateIndexes($scope.plugins);
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        mergeDataService.clearMergeData($scope.merge);
        $scope.itemToggled(item);
        updateMergePlugins();
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
});