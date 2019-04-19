ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.smash', {
        templateUrl: 'partials/smash.html',
        controller: 'smashController',
        url: '/smash'
    });
}]);

ngapp.controller('smashController', function ($scope, $timeout, $state, progressService, patchService, patchStatusService, hotkeyService, eventService, loadOrderService) {
    // helper functions
    let updatePatchStatuses = function() {
        $scope.patches.forEach(patchStatusService.updateStatus);
    };

    let init = function() {
        progressService.showProgress({ message: 'Loading patch data...' });
        patchService.loadPatches();
        $scope.patches = patchService.patches;
        updatePatchStatuses();
        progressService.hideProgress();
    };

    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        if (!shouldFinalize && !$scope.patches.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'smashSaveModalController',
            shouldFinalize: shouldFinalize,
            patches: $scope.patches
        });
    };

    // scope functions
    $scope.buildPatch = function(patch) {
        $scope.$root.patch = patch;
        $state.go('base.editSmash');
    };

    $scope.editPatch = function(patch) {
        $scope.$emit('openModal', 'editPatch', { patch });
    };

    $scope.deletePatch = function(patch) {
        let msg = `Are you sure you want to delete the patch "${patch.name}"?`;
        if (!confirm(msg)) return;
        $scope.patches.remove(patch);
    };

    $scope.createPatch = function() {
        $scope.$emit('openModal', 'editPatch', { patches: $scope.patches });
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', () => openSaveModal(false));

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'smashView');

    // save data and terminate xelib when application is being closed
    eventService.beforeClose(openSaveModal);

    // update load order and merge statuses when program regains focus
    eventService.onRegainFocus(() => {
        if (xelib.GetLoadedFileNames().length > 0) return;
        loadOrderService.init();
        $scope.$applyAsync(updatePatchStatuses);
    }, 3000);

    // initialization
    $timeout(init);
});
