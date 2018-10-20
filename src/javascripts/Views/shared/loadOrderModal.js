ngapp.controller('loadOrderModalController', function ($rootScope, $scope, $timeout, appModeService, loadOrderService) {
    $scope.loadOrderFilters = [{
        label: 'Search',
        modes: { select: true, jump: true },
        filter: (item, str) => item.filename.contains(str, true)
    }];

    // scope functions
    $scope.loadPlugins = function() {
        let loadOrder = $scope.loadOrder.reduce((a, item) => {
            if (item.active) a.push(item.filename);
            return a;
        }, []);
        console.log("Loading: \n" + loadOrder);
        xelib.ClearMessages();
        xelib.LoadPlugins(loadOrder.join('\n'));
        appModeService.goToAppView();
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
        loadOrderService.updateIndexes($scope.loadOrder);
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    $scope.$on('itemsReordered', function(e) {
        loadOrderService.updateIndexes($scope.loadOrder);
        e.stopPropagation();
    });

    // initialize view model properties
    loadOrderService.activateMode = true;
    loadOrderService.init();
    $scope.loadOrder = $rootScope.loadOrder;
});
