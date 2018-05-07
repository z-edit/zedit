ngapp.directive('pluginLoader', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/pluginLoader.html',
        controller: 'pluginLoaderController'
    }
});

ngapp.controller('pluginLoaderController', function($rootScope, $scope, $timeout, xelibService, spinnerFactory, timerService) {
    // helper variables
    let appMode = `z${$rootScope.appMode.capitalize()}`;
    timerService.start('loader');

    let logMessages = function() {
        let str = xelib.GetMessages();
        if (str.length <= 1) return;
        let messages = str.slice(0, -2).split('\n');
        messages.forEach(logger.info);
        $scope.loadingMessage = messages.last();
    };

    let doneLoading = function() {
        $scope.$emit('filesLoaded');
        $scope.$emit('setTitle', `${appMode} - ${$rootScope.profile.name}`);
        let secondsStr = timerService.getSecondsStr('loader');
        logger.info(`Files loaded in ${secondsStr}`);
    };

    // scope functions
    $scope.checkIfLoaded = function() {
        logMessages();
        let loaderStatus = xelib.GetLoaderStatus();

        if (loaderStatus === xelib.lsDone) {
            doneLoading();
        } else if (loaderStatus === xelib.lsError) {
            logger.error('CRITICAL ERROR: Loading plugins/resources failed!');
            $scope.$emit('terminate');
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
