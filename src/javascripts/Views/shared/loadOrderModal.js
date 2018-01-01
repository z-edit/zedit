ngapp.controller('loadOrderModalController', function ($scope, appModeService, loadOrderService) {
    // scope functions
    $scope.loadPlugins = function() {
        let loadOrder = $scope.modalOptions.loadOrder.
            filter((item) => { return item.active; }).
            map((item) => { return item.filename;  });
        console.log("Loading: \n" + loadOrder);
        xelib.ClearMessages();
        xelib.LoadPlugins(loadOrder.join('\n'));
        appModeService.setAppMode();
        $scope.$emit('closeModal');
    };

    $scope.itemToggled = function(item) {
        item.active ?
            loadOrderService.activateMasters(item) :
            loadOrderService.deactivateRequiredBy(item);
        if (!item.active) {
            item.required = false;
            item.title = '';
        }
        item.masters.forEach(loadOrderService.updateRequired);
        loadOrderService.updateIndexes($scope.modalOptions.loadOrder);
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    $scope.$on('itemsReordered', function(e) {
        loadOrderService.updateIndexes($scope.modalOptions.loadOrder);
        e.stopPropagation();
    });

    // initialize view model properties
    loadOrderService.activateMode = true;
    loadOrderService.init($scope.modalOptions.loadOrder);
});
