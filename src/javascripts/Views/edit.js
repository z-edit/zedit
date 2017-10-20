ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.edit', {
        templateUrl: 'partials/edit.html',
        controller: 'editController',
        url: '/edit'
    });
}]);

ngapp.controller('editController', function ($scope, layoutService, hotkeyService) {
    // load default layout
    $scope.mainPane = layoutService.buildDefaultLayout();

    // event handlers
    $scope.$on('settingsClick', function() {
        if (!$scope.loaded) return;
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', function() {
        if ($scope.$root.modalActive) return;
        let hasFilesToSave = false;
        xelib.WithHandles(xelib.GetElements(), function(files) {
            hasFilesToSave = !!files.find(function(file) {
                return xelib.GetIsModified(file);
            });
        });
        if (!hasFilesToSave) return;
        $scope.$emit('openModal', 'save', { shouldFinalize: false });
    });

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'editView');

    // save data and terminate xelib when application is being closed
    window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        e.returnValue = false;
        if (!$scope.$root.modalActive) {
            $scope.$emit('openModal', 'save', { shouldFinalize: true });
        }
    };
});
