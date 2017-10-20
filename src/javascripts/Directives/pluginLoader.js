ngapp.directive('pluginLoader', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/pluginLoader.html',
        controller: 'pluginLoaderController'
    }
});

ngapp.controller('pluginLoaderController', function($rootScope, $scope, $timeout, xelibService, spinnerFactory) {
    // helper variables
    let appMode = `z${$rootScope.appMode.capitalize()}`;

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
            $scope.$emit('setTitle', `${appMode} - ${$rootScope.profile.name}`);
            $scope.loaded = true;
        } else if (loaderStatus === xelib.lsError) {
            alert('There was a critical error during plugin/resource loading.  Please see the error log for more details.');
            fh.saveTextFile('erorr_log.txt', $scope.log);
            fh.openFile('error_log.txt');
            $scope.$emit('terminate');
        } else {
            $timeout($scope.checkIfLoaded, 250);
        }
    };

    // initialization
    $scope.loaded = false;
    $scope.log = xelib.GetMessages();
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    xelibService.printGlobals();

    $scope.checkIfLoaded();
    $scope.$emit('setTitle', `${appMode} - Loading Plugins`);
});
