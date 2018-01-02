ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.merge', {
        templateUrl: 'partials/merge.html',
        controller: 'mergeController',
        url: '/merge'
    });
}]);

ngapp.controller('mergeController', function ($scope, hotkeyService, mergeService) {
    $scope.merges = [];

    // helper functions
    let openSaveModal = function(shouldFinalize) {
        if (!shouldFinalize && !$scope.mergedPlugins.length) return;
        $scope.$emit('openModal', 'save', {
            shouldFinalize: shouldFinalize,
            merges: $scope.merges
        });
    };

    // scope functions
    $scope.buildMerge = function(merge) {
        mergeService.buildMerges([merge]);
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
        let mergesToBuild = $scope.merges.filter(function(merge) {
            return merge.status === 'Ready to be built';
        });
        mergeService.buildMerges(mergesToBuild);
    };

    $scope.toggleDetails = function(plugin) {
        plugin.showDetails = !plugin.showDetails;
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        //if (!$scope.loaded) return;
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
});