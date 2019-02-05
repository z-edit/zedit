ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.merge', {
        templateUrl: 'partials/merge.html',
        controller: 'mergeController',
        url: '/merge'
    });
}]);

ngapp.controller('mergeController', function($rootScope, $scope, $timeout, progressService, hotkeyService, mergeService, mergeBuilder, mergeDataService, mergeStatusService, loadOrderService, eventService, relinker, gameService) {
    let relinkGames = [xelib.gmTES5, xelib.gmSSE, xelib.gmFO4];

    // helper functions
    let updateMergeStatuses = function() {
        $scope.merges.forEach(mergeStatusService.updateStatus);
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
    };

    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        if (!shouldFinalize && !$scope.mergedPlugins.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'mergeSaveModalController',
            shouldFinalize: shouldFinalize,
            merges: $scope.merges
        });
    };

    // scope functions
    $scope.buildMerge = function(merge) {
        mergeBuilder.buildMerges([merge]);
        mergeStatusService.updateStatus(merge);
    };

    $scope.editMerge = function(merge) {
        $scope.$emit('openModal', 'editMerge', { merge: merge });
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
        mergeStatusService.updateStatus(merge);
    };

    $scope.createMerge = function() {
        $scope.$emit('openModal', 'editMerge', { merges: $scope.merges });
    };

    $scope.buildMerges = function() {
        let mergesToBuild = $scope.merges.filter(merge => {
            return merge.status === 'Ready to be built';
        });
        if (mergesToBuild.length === 0) return;
        mergeBuilder.buildMerges(mergesToBuild);
        mergesToBuild.forEach(merge => {
            mergeStatusService.updateStatus(merge);
        });
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
        mergeDataService.cacheDataFolders();
        $scope.merges.forEach(merge => merge.plugins.forEach(plugin => {
            mergeDataService.updatePluginDataFolder(plugin);
        }));
    });

    $scope.$on('save', openSaveModal);

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
