ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.sort', {
        templateUrl: 'partials/sort.html',
        controller: 'sortController',
        url: '/sort'
    });
}]);

ngapp.controller('sortController', function($rootScope, $scope, $timeout, progressService, hotkeyService, loadOrderService, eventService) {

    let init = function() {
        $scope.loadOrder = $rootScope.loadOrder;
        $scope.groupView = true;
    };

    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        if (!shouldFinalize && !$scope.mergedPlugins.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'sortSaveModalController',
            shouldFinalize: shouldFinalize
        });
    };

    // scope functions

    // event handlers
    $scope.$on('settingsClick', function() {
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', openSaveModal);

    // handle hotkeys
    // hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'sortView');

    // save data and terminate xelib when application is being closed
    eventService.beforeClose(openSaveModal);

    // update load order and merge statuses when program regains focus
    eventService.onRegainFocus(() => {
        if (xelib.GetLoadedFileNames().length > 0) return;
        loadOrderService.init();
    }, 3000);

    // initialization
    $timeout(init);
});
