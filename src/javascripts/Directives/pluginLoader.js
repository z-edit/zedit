ngapp.directive('pluginLoader', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/pluginLoader.html',
        controller: 'pluginLoaderController'
    }
});

ngapp.controller('pluginLoaderController', function($rootScope, $scope, $timeout, xelibService, spinnerFactory, timerService) {
    let {appMode, profile} = $rootScope;

    // initialization
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    $scope.loadingMessage = 'Loading...';

    // helper functions
    let logMessages = function() {
        let str = xelib.GetMessages();
        if (str.length <= 1) return;
        let messages = str.slice(0, -2).split('\n');
        messages.forEach(logger.info);
        $scope.loadingMessage = messages.last();
    };

    let doneLoading = function() {
        $scope.$emit('filesLoaded');
        $scope.$emit('setTitle', `${appMode.name} - ${profile.name}`);
        let secondsStr = timerService.getSecondsStr('loader');
        logger.info(`Files loaded in ${secondsStr}`);
    };

    let ignore = function(e) {
        e.stopPropagation();
        e.preventDefault();
    };

    let ignoreInput = function() {
        document.addEventListener('mousedown', ignore, true);
        document.addEventListener('click', ignore, true);
        document.addEventListener('mouseup', ignore, true);
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

    // event handlers
    $scope.$on('filesLoaded', function() {
        $scope.loaded = true;
        $timeout(() => {
            logger.info('Allowing click events');
            document.removeEventListener('mousedown', ignore, true);
            document.removeEventListener('click', ignore, true);
            document.removeEventListener('mouseup', ignore, true);
        }, 500);
    });

    $scope.$on('loadPlugins', function(e, loadOrder) {
        console.log("Loading: \n" + loadOrder);
        xelib.ClearMessages();
        xelib.LoadPlugins(loadOrder.join('\n'));
        timerService.start('loader');
        $scope.loaded = false;
        $scope.loadingMessage = 'Loading...';
        ignoreInput();
        $scope.checkIfLoaded();
        $scope.$emit('setTitle', `${appMode.name} - Loading Plugins`);
    });
});
