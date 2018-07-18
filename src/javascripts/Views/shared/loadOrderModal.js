ngapp.controller('loadOrderModalController', function ($scope, $timeout, appModeService, loadOrderService) {
    $scope.loadOrderFilters = [{
        label: 'Filename',
        modes: { select: true, jump: true },
        filter: (item, str) => item.filename.contains(str, true)
    }];

    // scope functions
    $scope.loadPlugins = function() {
        let loadOrder = $scope.modalOptions.loadOrder.
            filterOnKey('active').mapOnKey('filename');
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
