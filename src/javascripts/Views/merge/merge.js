ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.merge', {
        templateUrl: 'partials/merge.html',
        controller: 'mergeController',
        url: '/merge'
    });
}]);

ngapp.controller('mergeController', function ($scope, $timeout, progressService, hotkeyService, mergeService, mergeBuilder, mergeDataService, mergeStatusService, loadOrderService) {
    // helper functions
    let updateMergeStatuses = function() {
        $scope.merges.forEach(mergeStatusService.updateStatus);
    };

    let init = function() {
        progressService.showProgress({ message: 'Loading merge data...' });
        mergeDataService.cacheDataFolders();
        mergeService.loadMerges();
        progressService.hideProgress();
        $scope.allowRelinking = remote.getGlobal('env').allowRelinking;
        $scope.merges = mergeService.merges;
        updateMergeStatuses();
    };

    let openSaveModal = function(shouldFinalize) {
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
    };

    $scope.editMerge = function(merge) {
        $scope.$emit('openModal', 'editMerge', { merge: merge });
    };

    $scope.deleteMerge = function(merge) {
        $scope.merges.remove(merge);
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
    };

    $scope.relinkScripts = function() {
        $scope.$emit('openModal', 'relinkScripts', {merges: $scope.merges });
    };

    $scope.openDataFolder = function(plugin) {
        fh.openFile(plugin.dataFolder);
    };

    $scope.toggleDetails = function(plugin) {
        plugin.showDetails = !plugin.showDetails;
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', function() {
        if ($scope.$root.modalActive) return;
        openSaveModal(true);
    });

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'mergeView');

    // save data and terminate xelib when application is being closed
    window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        e.returnValue = false;
        if (!$scope.$root.modalActive) openSaveModal(true);
    };

    // update load order and merge statuses when program regains focus
    let focusTimeout, lostFocus = false;

    window.onblur = () => {
        focusTimeout = setTimeout(() => lostFocus = true, 3000);
    };

    window.onfocus = () => {
        if (focusTimeout) clearTimeout(focusTimeout);
        if (!lostFocus) return;
        loadOrderService.init();
        $scope.$applyAsync(updateMergeStatuses);
    };

    // initialization
    $timeout(init);
});