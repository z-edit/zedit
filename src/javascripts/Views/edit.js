ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.edit', {
        templateUrl: 'partials/edit.html',
        controller: 'editController',
        url: '/edit'
    });
}]);

ngapp.controller('editController', function ($scope, layoutService, hotkeyService) {
    let getPluginItem = function(file) {
        return {
            handle: file,
            filename: xelib.Name(file),
            active: true
        }
    };

    let openSaveModal = function(shouldFinalize) {
        let plugins = xelib.GetElements()
            .filter(xelib.GetIsModified)
            .map(getPluginItem);
        if (!shouldFinalize && !plugins.length) return;
        $scope.$emit('openModal', 'save', {
            shouldFinalize: shouldFinalize,
            plugins: plugins
        });
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        if (!$scope.loaded) return;
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', function() {
        if ($scope.$root.modalActive) return;
        openSaveModal(false);
    });

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'editView');

    // save data and terminate xelib when application is being closed
    window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        e.returnValue = false;
        if (!$scope.$root.modalActive) openSaveModal(true);
    };

    // initialization
    $scope.mainPane = layoutService.buildDefaultLayout();
});
