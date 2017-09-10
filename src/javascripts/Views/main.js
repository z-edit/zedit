ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.main', {
        templateUrl: 'partials/main.html',
        controller: 'mainController',
        url: '/main'
    });
}]);

ngapp.controller('mainController', function ($scope, $rootScope, $timeout, spinnerFactory, xelibService, layoutService) {
    // initialization
    $scope.loaded = false;
    $scope.log = xelib.GetMessages();
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    $scope.whiteOpts = spinnerFactory.whiteOptions;
    xelibService.printGlobals();

    // load default layout
    $scope.mainPane = layoutService.buildDefaultLayout();

    // scope functions
    $scope.getLoadingMessage = function() {
        $scope.loadingMessage = $scope.log.split('\n').slice(-2)[0];
    };

    $scope.checkIfLoaded = function() {
        $scope.log = $scope.log + xelib.GetMessages();
        $scope.getLoadingMessage();
        let loaderStatus = xelib.GetLoaderStatus();

        if (loaderStatus === xelib.lsDone) {
            console.log($scope.log);
            $scope.$emit('filesLoaded');
            $scope.$emit('setTitle', `zEdit - ${$rootScope.selectedProfile.name}`);
            $scope.loaded = true;
        } else if (loaderStatus === xelib.lsError) {
            alert('There was a critical error during plugin/resource loading.  Please see the error log for more details.');
            fh.saveTextFile('erorr_log.txt', $scope.log);
            fh.open('error_log.txt');
            $scope.$emit('terminate');
        } else {
            $timeout($scope.checkIfLoaded, 250);
        }
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        if ($scope.showLoader) return;
        $scope.$emit('openModal', 'settings');
    });
    $scope.$on('doneLoading', () => $scope.showLoader = false);
    $scope.$on('save', function() {
        if ($scope.$root.modalActive) return;
        let hasFilesToSave = false;
        xelibService.withHandles(xelib.GetElements(), function(files) {
            hasFilesToSave = !!files.find((file) => { return xelib.GetIsModified(file); });
        });
        if (!hasFilesToSave) return;
        $scope.$emit('openModal', 'save', { shouldFinalize: false });
    });

    $scope.$on('loading', function(e, message, canCancel) {
        if (!$scope.showLoader) $scope.showLoader = true;
        if ($scope.loadingMessage === "Cancelling...") return;
        $scope.loadingMessage = message || "Loading...";
        $scope.canCancel = canCancel;
    });

    // save data and terminate xelib when application is being closed
    window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        e.returnValue = false;
        if (!$scope.$root.modalActive) {
            $scope.$emit('openModal', 'save', { shouldFinalize: true });
        }
    };

    // initialization
    $scope.checkIfLoaded();
    $scope.$emit('setTitle', 'zEdit - Loading Plugins');
});
