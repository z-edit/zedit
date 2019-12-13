ngapp.controller('browseModulesController', function($scope, extensionRegistry, extensionService, spinnerFactory, moduleFilters) {
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    $scope.filters = moduleFilters;

    let installedModules = extensionService.getInstalledModules();

    let setInstalled = function(module) {
        module.installed = installedModules.some(m => m.id === module.id);
    };

    extensionRegistry.retrieveModules().then(modules => {
        modules.forEach(setInstalled);
        $scope.allModules = modules;
        $scope.updateItems();
    });

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

    $scope.installModule = function() {
        // TODO
    };
});
