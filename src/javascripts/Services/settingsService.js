ngapp.service('settingsService', function() {
    let service = this,
        tabs = [{
            label: 'Core',
            templateUrl: 'partials/settings/core.html',
            controller: () => {},
            defaultSettings: { theme: 'Vanilla' }
        }];

    this.buildSettings = function(settings) {
        let defaults = {};
        tabs.forEach((tab) => Object.deepAssign(defaults, tab.defaultSettings));
        service.settings = Object.deepAssign(defaults, settings);
    };

    this.loadSettings = function(profileName) {
        service.currentProfile = profileName;
        service.profilePath = `profiles/${profileName}`;
        service.settingsPath = `${service.profilePath}/settings.json`;
        let settings = fh.loadJsonFile(service.settingsPath, {});
        service.buildSettings(settings);
        service.saveSettings();
    };

    this.saveSettings = function() {
        fh.saveJsonFile(service.settingsPath, service.settings);
    };

    this.registerSettings = function(settingsTab) {
        tabs.push(settingsTab);
    };

    this.getTabs = function() {
        return tabs;
    }
});
