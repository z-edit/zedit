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
    let appMode = `z${$rootScope.appMode.capitalize()}`,
        startTime = new Date();

    let logMessages = function() {
        let str = xelib.GetMessages();
        if (str.length <= 1) return;
        let messages = str.slice(0, -2).split('\n');
        messages.forEach(logger.info);
        $scope.loadingMessage = messages.last();
    };

    let loaderError = function() {
        const msg = 'There was a critical error during plugin/resource loading.  Please see the error log for more details.';
        logger.error(msg) && alert(msg);
        $scope.$emit('terminate');
    };

    let getLoadTime = function() {
        let duration = (new Date() - startTime) / 1000.0;
        return `${duration.toFixed(3)}s`;
    };

    // scope functions
    $scope.checkIfLoaded = function() {
        logMessages();
        let loaderStatus = xelib.GetLoaderStatus();

        if (loaderStatus === xelib.lsDone) {
            $scope.$emit('filesLoaded');
            $scope.$emit('setTitle', `${appMode} - ${$rootScope.profile.name}`);
            $scope.loaded = true;
            logger.info(`Files loaded in ${getLoadTime()}`)
        } else if (loaderStatus === xelib.lsError) {
            loaderError();
        } else {
            $timeout($scope.checkIfLoaded, 250);
        }
    };

    // initialization
    $scope.loaded = false;
    $scope.spinnerOpts = spinnerFactory.defaultOptions;

    $scope.checkIfLoaded();
    $scope.$emit('setTitle', `${appMode} - Loading Plugins`);
});
