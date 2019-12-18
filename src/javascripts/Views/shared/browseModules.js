ngapp.controller('browseModulesController', function($scope, extensionRegistry, extensionService, progressService, spinnerFactory, moduleFilters) {
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    $scope.filters = moduleFilters;

    let installedModules = extensionService.getInstalledModules();

    extensionRegistry.retrieveModules().then(modules => {
        modules.forEach(setInstalled);
        $scope.allModules = modules;
        $scope.updateItems();
    });

    // helper functions
    let setInstalled = function(module) {
        module.installed = installedModules.some(m => m.id === module.id);
    };

    let moduleInstalled = function(module) {
        setTimeout(() => {
            alert(`Installed ${module.name} ${module.version} successfully!`);
        }, 100);
        progressService.hideProgress();
        $scope.$applyAsync(() => {
            module.currentVersion = module.version;
            module.installed = true;
        });
    };

    let installationError = function(error) {
        setTimeout(() => {
            alert(`Error installing module: ${error.stack}`);
        }, 100);
        progressService.hideProgress();
    };

    // scope functions
    $scope.updateItems = function() {
        if (!$scope.allModules) return;
        $scope.modules = $scope.allModules.filter(module => {
            if (!$scope.activeFilters) return true;
            return $scope.activeFilters.every(filter => {
                return filter.test(module, filter.value);
            });
        });
    };

    $scope.openLink = url => fh.openUrl(url);

    $scope.installModule = function(module) {
        if (!module.links.github) return;
        progressService.showProgress({
            determinate: false,
            message: `Installing ${module.name}...`
        });
        extensionRegistry.installModule(module)
            .then(moduleInstalled, installationError);
    };
});
