ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Smash Settings',
        appModes: ['smash'],
        templateUrl: 'partials/settings/smash.html',
        defaultSettings: {
            smash: {
                patchPath: fh.jetpack.path('patches'),
                recordHeaderRules: {
                    "Record Flags": true,
                    "Version Control Info 1": false,
                    "Version Control Info 2": false
                },
                recordsToSkip: ['DOBJ', 'NAVI', 'NAVM']
            }
        }
    });
});
