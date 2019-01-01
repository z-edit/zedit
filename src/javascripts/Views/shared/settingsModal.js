ngapp.controller('settingsModalController', function($scope, settingsService, tabService) {
    // initialization
    $scope.settings = settingsService.settings;
    $scope.globalSettings = settingsService.globalSettings;
    $scope.profileName = settingsService.currentProfile;
    $scope.tabs = settingsService.getTabs();
    tabService.buildFunctions($scope);

    // scope functions
    $scope.saveSettings = function(closeModal = true) {
        settingsService.saveProfileSettings();
        settingsService.saveGlobalSettings();
        if (closeModal) $scope.$emit('closeModal');
    };

    $scope.browseSettingsPath = function(settingsKey, title) {
        let defaultPath = $scope.settings[settingsKey] || fh.appPath,
            newPath = fh.selectDirectory(title, defaultPath);
        if (newPath) $scope.settings[settingsKey] = newPath;
    };

    $scope.browseSettingsFile = function(settingsKey, title, filters = []) {
        let path = $scope.settings[settingsKey],
            defaultPath =  path ? fh.getFileBase(path) : fh.appPath,
            newPath = fh.selectFile(title, defaultPath, filters);
        if (newPath) $scope.settings[settingsKey] = newPath;
    };
});
