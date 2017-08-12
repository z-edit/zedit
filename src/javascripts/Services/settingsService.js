ngapp.service('settingsService', function() {
    var service = this;
    var defaultSettings = {
        'cacheErrors': true,
        'theme': 'Vanilla'
    };

    this.loadSettings = function(profileName) {
        service.currentProfile = profileName;
        service.profilePath = `app/profiles/${profileName}`;
        service.settingsPath = `${service.profilePath}/settings.json`;
        service.settings = fileHelpers.loadJsonFile(service.settingsPath, defaultSettings);
    };

    this.saveSettings = function() {
        fileHelpers.saveJsonFile(service.settingsPath, service.settings);
    };
});
