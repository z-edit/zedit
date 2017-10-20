ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.clean', {
        templateUrl: 'partials/clean.html',
        controller: 'cleanController',
        url: '/clean'
    });
}]);

ngapp.controller('cleanController', function ($rootScope, $scope, $timeout, $element, profileService, hotkeyService, pluginErrorService, errorTypeFactory) {
    let updatePluginsToCheckCount = function() {
        $scope.pluginsToCheckCount = $scope.plugins.filter(function(plugin) {
            return !plugin.skip;
        }).length;
    };

    // scope functions
    $scope.toggleSkip = function(plugin) {
        plugin.skip = !plugin.skip;
        updatePluginsToCheckCount();
    };

    $scope.groupErrors = function(plugin) {
        plugin.groupedErrors = errorTypeFactory.errorTypes();
        plugin.groupedErrors.forEach(function(errorGroup) {
            errorGroup.resolution = 'auto';
            errorGroup.showGroup = false;
            errorGroup.errors = plugin.errors.filter(function(error) {
                return error.group === errorGroup.group;
            });
            $scope.changeErrorResolution(errorGroup);
        });
    };

    $scope.changeErrorResolution = function(errorGroup) {
        if (errorGroup.resolution === 'manual') {
            $scope.errorsToResolve = errorGroup.errors;
            $scope.toggleResolveModal(true);
        } else {
            pluginErrorService.setGroupResolutions(errorGroup);
        }
    };

    $scope.resolveError = function(group, error) {
        group.resolution = 'manual';
        $scope.errorsToResolve = [error];
        $scope.toggleResolveModal(true);
    };

    $scope.setPluginErrors = function(plugin, errors) {
        pluginErrorService.getErrorMessages(errors);
        plugin.errors = errors;
        plugin.status = 'Found ' + errors.length + ' errors';
        plugin.checking = false;
        plugin.checked = true;
        $scope.totalErrors += errors.length;
        $scope.groupErrors(plugin);
    };

    $scope.getErrors = function() {
        try {
            $scope.checkedPlugins++;
            let errors = xelib.GetErrors();
            console.log(errors);
            $scope.setPluginErrors($scope.currentPlugin, errors);
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

    $scope.clearErrors = function(plugin) {
        if (!plugin.hasOwnProperty('errors')) return;
        $scope.totalErrors -= plugin.errors.length;
        delete plugin.errors;
        delete plugin.groupedErrors;
    };

    $scope.checkPluginForErrors = function(plugin) {
        plugin.status = 'Checking for errors...';
        plugin.checking = true;
        $scope.clearErrors(plugin);
        try {
            xelib.CheckForErrors(plugin._id);
            $scope.currentPlugin = plugin;
            $scope.pollErrorChecking();
        } catch (e) {
            console.log(e);
        }
    };

    $scope.endErrorCheck = function() {
        $scope.checkingDone = true;
        $scope.plugins.forEach(function(plugin) {
            if (!plugin.hasOwnProperty('groupedErrors')) return;
            $scope.groupedErrors.forEach(function(errorGroup, index) {
                let pluginErrors = plugin.groupedErrors[index].errors;
                errorGroup.errors.unite(pluginErrors);
            });
        });
    };

    $scope.checkNextPlugin = function() {
        let nextPlugin = $scope.plugins.find(function(plugin) {
            return !plugin.skip && plugin.status === 'Queued';
        });
        if (!nextPlugin) {
            $scope.endErrorCheck();
            return;
        }
        $scope.checkPluginForErrors(nextPlugin);
    };

    $scope.startCheck = function() {
        $scope.checkNextPlugin();
        $scope.pluginsToCheck = $scope.plugins.filter(function(plugin) {
            return !plugin.skip;
        }).length;
        $scope.checking = true;
    };

    $scope.ignorePlugin = function(filename) {
        let game = profileService.getGame($rootScope.profile.gameMode),
            gameEsmFilename = `${game.shortName}.esm`;
        return filename.endsWith('.dat') || (filename === gameEsmFilename);
    };

    $scope.getPlugins = function() {
        $scope.plugins = xelib.GetElements().map(function(file) {
            return {
                _id: file,
                filename: xelib.Name(file),
                hash: xelib.MD5Hash(file),
                status: 'Queued',
                skip: false,
                showContent: false
            };
        }).filter(function(plugin) {
            return !$scope.ignorePlugin(plugin.filename);
        });
    };

    $scope.buildErrors = function(plugin, errors) {
        return errors.map(function(error) {
            let file = xelib.GetElement(plugin._id, xelib.IntToHex(error.f));
            let x = {
                handle: file,
                group: error.g,
                form_id: error.f,
                name: xelib.LongName(file)
            };
            x.data = error.hasOwnProperty('d') ? error.d : '';
            x.path = error.hasOwnProperty('p') ? error.p : '';
            return x;
        });
    };

    $scope.loadCache = function() {
        $scope.plugins.forEach(function(plugin) {
            let filePath = `cache\\${plugin.filename}-${plugin.hash}.json`;
            if (fh.appDir.exists(filePath)) {
                let cachedErrors = fh.loadJsonFile(filePath) || {},
                    errors = $scope.buildErrors(plugin, cachedErrors);
                $scope.setPluginErrors(plugin, errors);
                plugin.skip = true;
                plugin.status = `Found ${plugin.errors.length} cached errors`;
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
        let hasFilesToSave = false;
        xelib.WithHandles(xelib.GetElements(), function(files) {
            hasFilesToSave = !!files.find(function(file) {
                return xelib.GetIsModified(file);
            });
        });
        if (!hasFilesToSave) return;
        $scope.$emit('openModal', 'save', { shouldFinalize: false });
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
        if (!$scope.$root.modalActive) {
            $scope.$emit('openModal', 'save', { shouldFinalize: true });
        }
    };

    // initialization
    $scope.checkedPlugins = 0;
    $scope.totalErrors = 0;
    $scope.plugins = [];
    $scope.groupedErrors = errorTypeFactory.errorTypes();
});
