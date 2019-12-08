ngapp.controller('browseThemesController', function($scope, extensionRegistry, extensionService, spinnerFactory) {
    $scope.themesFolderPath = fh.appDir.path('themes');
    $scope.spinnerOpts = spinnerFactory.defaultOptions;

    let installedThemes = extensionService.getInstalledThemes();

    let setInstalled = function(theme) {
        theme.installed = installedThemes.some(t => t.name === theme.name);
    };

    extensionRegistry.retrieveThemes().then(themes => {
        themes.forEach(setInstalled);
        $scope.themes = themes;
    });

    $scope.openLink = url => fh.openUrl(url);

    $scope.installTheme = function() {
        // TODO
    };
});
