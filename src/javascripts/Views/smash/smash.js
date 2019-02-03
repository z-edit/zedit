ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.smash', {
        templateUrl: 'partials/smash.html',
        controller: 'smashController',
        url: '/smash'
    });
}]);

ngapp.controller('smashController', function($scope, $timeout, progressService, hotkeyService, smashService, eventService, layoutService) {
    // helper functions
    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        if (!shouldFinalize) return;
        $scope.$emit('openModal', 'save', {
            controller: 'smashSaveModalController',
            shouldFinalize: shouldFinalize,
        });
    };

    // event handlers
    $scope.onViewportRender = function() {
        if (verbose) logger.info('Rendering viewport...');
    };

    $scope.$on('settingsClick', function() {
        if (!$scope.loaded) return;
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', () => openSaveModal(false));

    $scope.$on('linkView', function(e, view) {
        $scope.$broadcast('toggleLinkMode', view);
        e.stopPropagation && e.stopPropagation();
    });

    // save data and terminate xelib when application is being closed
    eventService.beforeClose(openSaveModal);

    // initialization
    $scope.mainPane = layoutService.buildDefaultLayout('Smash');
});
