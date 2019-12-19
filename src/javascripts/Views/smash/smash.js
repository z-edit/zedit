ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.smash', {
        templateUrl: 'partials/smash.html',
        controller: 'smashController',
        url: '/smash'
    });
}]);

ngapp.controller('smashController', function($rootScope, $scope, $timeout, $state, progressService, smashPatchService, smashStatusService, hotkeyInterface, eventService, gameService, loadOrderService, smashPrepService, errorService) {
    // helper functions
    let updatePatchStatuses = function() {
        $scope.patches.forEach(smashStatusService.updateStatus);
    };

    let getPluginHash = function(plugin) {
        let pluginPath = fh.path(gameService.dataPath, plugin.filename);
        return fh.getMd5Hash(pluginPath);
    };

    let init = function() {
        $scope.$emit('setTitle', 'zSmash - Loading patches');
        progressService.showProgress({ message: 'Loading patch data...' });
        $rootScope.loadOrder.forEach(getPluginHash);
        smashPatchService.loadPatches();
        $scope.patches = smashPatchService.patches;
        updatePatchStatuses();
        progressService.hideProgress();
        $scope.$emit('setTitle', 'zSmash - Patch management');
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
        $scope.$emit('setTitle', 'zSmash - Building patch');
        errorService.tryPromise(() => smashPrepService.preparePatch(patch), () => {
            progressService.hideProgress();
            $rootScope.patch = patch;
            $state.go('base.buildPatch');
        }, err => {
            $scope.$emit('setTitle', 'zSmash - Patch management');
            progressService.hideProgress();
            alert('Error preparing patch:\n' + err);
        });
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
    hotkeyInterface($scope, 'onKeyDown', 'smashView');

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
