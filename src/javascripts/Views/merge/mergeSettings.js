ngapp.controller('mergeSettingsController', function($scope) {
    // TODO?
});

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Merge Settings',
        appModes: ['merge'],
        templateUrl: 'partials/settings/merge.html',
        defaultSettings: {
            mergePath: fh.appDir.path('merges')
        }
    });
});