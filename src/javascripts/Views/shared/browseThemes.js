ngapp.controller('browseThemesController', function($scope, extensionRegistry, extensionService, spinnerFactory, themeFilters) {
    $scope.spinnerOpts = spinnerFactory.defaultOptions;
    $scope.filters = themeFilters;

    let installedThemes = extensionService.getInstalledThemes();

    let setInstalled = function(theme) {
        theme.installed = installedThemes.some(t => t.name === theme.name);
    };

    extensionRegistry.retrieveThemes().then(themes => {
        themes.forEach(setInstalled);
        $scope.allThemes = themes;
        $scope.updateItems();
    });

    $scope.updateItems = function() {
        if (!$scope.allThemes) return;
        $scope.themes = $scope.allThemes.filter(module => {
            return $scope.activeFilters.every(filter => {
                return filter.test(module, filter.value);
            });
        });
    };

    $scope.openLink = url => fh.openUrl(url);

    $scope.installTheme = function() {
        // TODO
    };
});
