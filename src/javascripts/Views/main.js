ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.main', {
        templateUrl: 'partials/main.html',
        controller: 'mainController',
        url: '/main'
    });
}]);

ngapp.controller('mainController', function ($scope, $rootScope, $timeout, spinnerFactory, xelibService, layoutService, formUtils) {
    $scope.loaded = false;
    $scope.log = xelib.GetMessages();
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    $scope.whiteOpts = spinnerFactory.whiteOptions;
    xelibService.printGlobals();

    // inherited functions
    formUtils.buildToggleModalFunction($scope, 'LoadingModal');
    formUtils.buildToggleModalFunction($scope, 'SettingsModal');
    formUtils.buildToggleModalFunction($scope, 'SaveModal');
    formUtils.buildToggleModalFunction($scope, 'AutomateModal');

    // load default layout
    $scope.mainPane = layoutService.buildDefaultLayout();

    // scope functions
    $scope.getLoadingMessage = function() {
        $scope.loadingMessage = $scope.log.split('\n').slice(-2)[0];
    };

    $scope.checkIfLoaded = function() {
        $scope.log = $scope.log + xelib.GetMessages();
        $scope.getLoadingMessage();
        if (xelib.GetLoaderDone()) {
            console.log($scope.log);
            $scope.$emit('setTitle', `zEdit - ${$rootScope.selectedProfile.name}`);
            $scope.loaded = true;
        } else {
            $timeout($scope.checkIfLoaded, 250);
        }
    };

    // event handlers
    $scope.$on('showAutomateModal', () => $scope.toggleAutomateModal(true));
    $scope.$on('settingsClick', () => $scope.toggleSettingsModal(true));
    $scope.$on('doneLoading', () => $scope.toggleLoadingModal());
    $scope.$on('save', function() {
        if ($scope.$root.modalActive) return;
        let hasFilesToSave = false;
        xelib.WithHandles(xelib.GetElements(), function(files) {
            hasFilesToSave = !!files.find((file) => { return xelib.GetIsModified(file); });
        });
        if (!hasFilesToSave) return;
        $scope.toggleSaveModal(true);
    });

    $scope.$on('loading', function(e, message, canCancel) {
        if ($scope.showLoadingModal && $scope.loadingMessage === "Cancelling...") return;
        if (!$scope.showLoadingModal) $scope.toggleLoadingModal(true);
        $scope.loadingMessage = message || "Loading...";
        $scope.canCancel = canCancel;
    });

    // save data and terminate xelib when application is being closed
    window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        e.returnValue = false;
        if (!$scope.$root.modalActive) {
            $scope.shouldFinalize = true;
            $scope.toggleSaveModal(true);
        }
    };

    // initialization
    $scope.checkIfLoaded();
    $scope.$emit('setTitle', 'zEdit - Loading Plugins');
});
