ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.clean', {
        templateUrl: 'partials/clean.html',
        controller: 'cleanController',
        url: '/clean'
    });
}]);

ngapp.controller('cleanController', function ($rootScope, $scope, $timeout, $element, hotkeyService, pluginErrorService, errorMessageService, errorTypeFactory, errorCacheService, gameService) {
    // helper functions
    let updatePluginsToCheckCount = function() {
        $scope.pluginsToCheckCount = $scope.plugins.filter(plugin => {
            return !plugin.skip;
        }).length;
    };

    let openSaveModal = function(shouldFinalize) {
        let pluginsToSave = $scope.plugins.filter(plugin => {
            return plugin.hasOwnProperty('errors');
        });
        if (!shouldFinalize && !pluginsToSave.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'cleanSaveModalController',
            shouldFinalize: shouldFinalize,
            plugins: pluginsToSave
        });
    };

    let clearErrors = function(plugin) {
        if (!plugin.hasOwnProperty('errors')) return;
        $scope.totalErrors -= plugin.errors.length;
        delete plugin.errors;
        delete plugin.groupedErrors;
    };

    // scope functions
    $scope.toggleSkip = function(plugin) {
        plugin.skip = !plugin.skip;
        updatePluginsToCheckCount();
    };

    $scope.changeErrorResolution = function(errorGroup) {
        if (errorGroup.resolution === 'manual') {
            $scope.$emit('openModal', 'resolve', {
                errors: errorGroup.errors
            });
        } else {
            pluginErrorService.setGroupResolutions(errorGroup);
        }
    };

    $scope.resolveError = function(group, error) {
        group.resolution = 'manual';
        $scope.$emit('openModal', 'resolve', {
            errors: [error]
        });
    };

    $scope.getErrors = function() {
        try {
            $scope.checkedPlugins++;
            let errors = xelib.GetErrors();
            console.log(errors);
            pluginErrorService.setPluginErrors($scope.currentPlugin, errors);
            pluginErrorService.groupErrors($scope.currentPlugin);
            $scope.totalErrors += errors.length;
        } catch (e) {
            console.log(e);
        }
    };

    $scope.pollErrorChecking = function() {
        let done = xelib.GetErrorThreadDone();
        if (done) {
            $scope.getErrors();
            $scope.checkNextPlugin();
        } else {
            $timeout($scope.pollErrorChecking, 100);
        }
    };

    $scope.checkPluginForErrors = function(plugin) {
        plugin.status = 'Checking for errors...';
        plugin.checking = true;
        try {
            xelib.CheckForErrors(plugin.handle);
            $scope.currentPlugin = plugin;
            $scope.pollErrorChecking();
        } catch (e) {
            console.log(e);
        }
    };

    $scope.endErrorCheck = function() {
        $scope.checkingDone = true;
        $scope.plugins.forEach(plugin => {
            if (!plugin.hasOwnProperty('groupedErrors')) return;
            $scope.groupedErrors.forEach((errorGroup, index) => {
                let pluginErrors = plugin.groupedErrors[index].errors;
                errorGroup.errors.unite(pluginErrors);
            });
        });
    };

    $scope.checkNextPlugin = function() {
        let nextPlugin = $scope.plugins.find(plugin => {
            return !plugin.skip && plugin.status === 'Queued';
        });
        if (!nextPlugin) {
            $scope.endErrorCheck();
            return;
        }
        $scope.checkPluginForErrors(nextPlugin);
    };

    $scope.startCheck = function() {
        $scope.pluginsToCheck = $scope.plugins.filter(plugin => {
            if (!plugin.skip) {
                clearErrors(plugin);
                plugin.status = 'Queued';
                return true;
            }
        }).length;
        $scope.checkNextPlugin();
        $scope.checking = true;
    };

    $scope.ignorePlugin = function(filename) {
        let game = gameService.getGame($rootScope.profile.gameMode),
            gameEsmFilename = `${game.shortName}.esm`;
        return filename.endsWith('.dat') || (filename === gameEsmFilename);
    };

    $scope.getPlugins = function() {
        $scope.plugins = xelib.GetElements().map(file => ({
            handle: file,
            filename: xelib.Name(file),
            status: 'Queued',
            skip: false,
            showContent: false
        })).filter(plugin => {
            if ($scope.ignorePlugin(plugin.filename)) return;
            plugin.filePath = fh.path(gameService.dataPath, plugin.filename);
            plugin.hash = md5File.sync(plugin.filePath);
            return true;
        });
    };

    $scope.loadCache = function() {
        $scope.plugins.forEach(plugin => {
            if (errorCacheService.loadPluginErrors(plugin)) {
                $scope.totalErrors += plugin.errors.length;
                pluginErrorService.groupErrors(plugin);
            }
        });
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        if (!$scope.loaded) return;
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', function() {
        if ($scope.$root.modalActive) return;
        openSaveModal(true);
    });

    $scope.$watch('loaded', function() {
        if (!$scope.loaded) return;
        $scope.getPlugins();
        $scope.loadCache();
        updatePluginsToCheckCount();
    });

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'cleanView');

    // save data and terminate xelib when application is being closed
    window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        e.returnValue = false;
        if (!$scope.$root.modalActive) openSaveModal(true);
    };

    // initialization
    $scope.checkedPlugins = 0;
    $scope.totalErrors = 0;
    $scope.plugins = [];
    $scope.groupedErrors = errorTypeFactory.errorTypes();
});
