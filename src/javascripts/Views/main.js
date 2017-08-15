ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.main', {
        templateUrl: 'partials/main.html',
        controller: 'mainController',
        url: '/main'
    });
}]);

ngapp.controller('mainController', function ($scope, $rootScope, $timeout, spinnerFactory, xelibService, layoutService) {
    $scope.loaded = false;
    $scope.log = xelib.GetMessages();
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    $scope.whiteOpts = spinnerFactory.whiteOptions;
    xelibService.printGlobals();

    // load default layout
    $scope.mainPane = layoutService.buildDefaultLayout();

    // scope functions
    $scope.toggleSettingsModal = function(visible) {
        $scope.showSettingsModal = visible;
    };

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
    $scope.$on('settingsClicked', function() {
        $scope.toggleSettingsModal(true);
    });

    $scope.$on('loading', function(e, message, canCancel) {
        if ($scope.showLoadingModal && $scope.loadingMessage === "Cancelling...") return;
        $scope.showLoadingModal = true;
        $scope.loadingMessage = message || "Loading...";
        $scope.canCancel = canCancel;
    });

    $scope.$on('doneLoading', function() {
        $scope.showLoadingModal = false;
    });

    // save data and terminate xelib when application is being closed
    /*window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        //$scope.toggleSaveModal(true);
        e.returnValue = true;//false;
    };*/

    // initialization
    $scope.checkIfLoaded();
    $scope.$emit('setTitle', 'zEdit - Loading Plugins');
});
