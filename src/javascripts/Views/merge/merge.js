ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.merge', {
        templateUrl: 'partials/merge.html',
        controller: 'mergeController',
        url: '/merge'
    });
}]);

ngapp.controller('mergeController', function($rootScope, $scope, $timeout, progressService, hotkeyService, mergeService, mergeLoadService, mergeBuilder, mergeDataService, mergeStatusService, loadOrderService, eventService, relinker, gameService) {
    let {cacheDataFolders, updatePluginDataFolder} = mergeDataService,
        {readyToBeBuilt, updateStatus} = mergeStatusService,
        relinkGames = [xelib.gmTES5, xelib.gmSSE, xelib.gmTES5VR];

    // helper functions
    let updateMergeStatuses = function() {
        $scope.merges.forEach(updateStatus);
    };

    let updateMergeLoadOrders = function() {
        $scope.merges.filter(merge => {
            return merge.useGameLoadOrder &&
                merge.status !== 'Plugins unavailable';
        }).forEach(mergeLoadService.resetMergeLoadOrder);
    };

    let init = function() {
        progressService.showProgress({ message: 'Loading merge data...' });
        mergeDataService.cacheDataFolders();
        mergeService.loadMerges();
        progressService.hideProgress();
        let currentGameMode = $rootScope.profile.gameMode;
        $scope.allowRelinking = relinkGames.includes(currentGameMode);
        $scope.merges = mergeService.merges;
        updateMergeStatuses();
        updateMergeLoadOrders();
    };

    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        if (!shouldFinalize && !$scope.merges.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'mergeSaveModalController',
            shouldFinalize: shouldFinalize,
            merges: $scope.merges
        });
    };

    // scope functions
    $scope.buildMerge = function(merge) {
        mergeBuilder.buildMerges([merge]);
    };

    $scope.editMerge = function(merge) {
        $scope.$emit('openModal', 'editMerge', { merge });
    };

    $scope.deleteMerge = function(merge) {
        let msg = `Are you sure you want to delete the merge "${merge.name}"?`;
        if (!confirm(msg)) return;
        $scope.merges.remove(merge);
    };

    $scope.removeUnavailablePlugins = function(merge) {
        merge.plugins = merge.plugins.filter(plugin => plugin.available);
        merge.loadOrder = merge.loadOrder.filter(filename => {
            let filePath = fh.path(gameService.dataPath, filename);
            return fh.jetpack.exists(filePath);
        });
        updateStatus(merge);
    };

    $scope.createMerge = function() {
        $scope.$emit('openModal', 'editMerge', { merges: $scope.merges });
    };

    $scope.buildMerges = function() {
        let mergesToBuild = $scope.merges.filter(readyToBeBuilt);
        if (mergesToBuild.length === 0) return;
        mergeBuilder.buildMerges(mergesToBuild);
    };

    $scope.relinkScripts = function() {
        $timeout(() => relinker.run($scope.merges));
    };

    $scope.openDataFolder = function(plugin) {
        fh.openFile(plugin.dataFolder);
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('updateDataFolders', function() {
        cacheDataFolders();
        $scope.merges.forEach(merge =>
            merge.plugins.forEach(updatePluginDataFolder)
        );
    });

    $scope.$on('save', () => openSaveModal(false));

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'mergeView');

    // save data and terminate xelib when application is being closed
    eventService.beforeClose(openSaveModal);

    // update load order and merge statuses when program regains focus
    eventService.onRegainFocus(() => {
        if (xelib.GetLoadedFileNames().length > 0) return;
        loadOrderService.init();
        $scope.$applyAsync(updateMergeStatuses);
    }, 3000);

    // initialization
    $timeout(init);
});
