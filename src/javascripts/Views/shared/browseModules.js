ngapp.controller('browseModulesController', function($scope, extensionRegistry, extensionService, spinnerFactory) {
    $scope.modulesFolderPath = fh.appDir.path('modules');
    $scope.spinnerOpts = spinnerFactory.defaultOptions;

    let installedModules = extensionService.getInstalledModules();

    let setInstalled = function(module) {
        module.installed = installedModules.some(m => m.id === module.id);
    };

    extensionRegistry.retrieveModules().then(modules => {
        modules.forEach(setInstalled);
        $scope.modules = modules;
    });

    $scope.openLink = url => fh.openUrl(url);

    $scope.installModule = function() {
        // TODO
    };
});
