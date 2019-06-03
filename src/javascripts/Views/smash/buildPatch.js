ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.buildPatch', {
        templateUrl: 'partials/buildPatch.html',
        controller: 'buildPatchController',
        url: '/build-patch'
    });
}]);

ngapp.controller('buildPatchController', function($rootScope, $scope, $timeout,  hotkeyInterface, eventService, layoutService, patchBuilder) {
    // helper functions
    let getPluginItem = file => ({
        handle: file,
        filename: xelib.Name(file),
        active: true
    });

    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        let plugins = xelib.GetElements()
            .filter(xelib.GetIsModified)
            .map(getPluginItem);
        if (!shouldFinalize && !plugins.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'patchSaveModalController',
            shouldFinalize: shouldFinalize,
            plugins: plugins
        });
    };

    let loadPlugins = function() {
        let {filename, plugins, updated} = $rootScope.patch,
            loadOrder = plugins.mapOnKey('filename');
        if (updated && $rootScope.loadOrder.includes(filename))
            loadOrder.push(filename);
        $rootScope.$broadcast('loadPlugins', loadOrder);
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        if (!$scope.loaded) return;
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', () => openSaveModal(false));

    $scope.$on('linkView', function(e, view) {
        $scope.$broadcast('toggleLinkMode', view);
        e.stopPropagation && e.stopPropagation();
    });

    $scope.$on('filesLoaded', function() {
        $scope.patchBuilt = true;
        //patchBuilder.showProgress();
        // TODO: re-enable
        //patchBuilder.buildPatch($rootScope.patch);
    });

    $scope.$on('patchBuilt', function() {
        $scope.patchBuilt = true;
    });

    // handle hotkeys
    //hotkeyInterface($scope, 'onKeyDown', 'buildPatchView');

    // save data and terminate xelib when application is being closed
    eventService.beforeClose(openSaveModal);

    // initialization
    $scope.mainPane = layoutService.buildDefaultLayout('BuildPatch');
    $timeout(loadPlugins);
});
