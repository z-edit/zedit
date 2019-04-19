ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Smash Settings',
        appModes: ['smash'],
        templateUrl: 'partials/settings/smash.html',
        defaultSettings: {
            patchPath: fh.jetpack.path('patches')
        }
    });
});
