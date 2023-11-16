ngapp.controller('archiveCreationSettingsController', function($scope) {
    $scope.addFileExpr = function() {
        $scope.settings.archiveCreation.fileExprs.push('')
    };

    $scope.removeFileExpr = function(index) {
        $scope.settings.archiveCreation.fileExprs.splice(index, 1);
    };
});

ngapp.run(function($rootScope, settingsService, gameService) {
    const GIGABYTE = 1024 * 1024 * 1024;

    settingsService.registerSettings({
        label: 'Archive Creation Settings',
        templateUrl: `partials/settings/archiveCreation.html`,
        controller: 'archiveCreationSettingsController',
        defaultSettings: {
            archiveCreation: {
                fileExprs: [
                    'docs/**/*',
                    'interface/**/*',
                    'meshes/**/*',
                    'lodsettings/**/*',
                    'music/**/*',
                    'scripts/*.pex',
                    'scripts/source/*.psc',
                    'seq/*.seq',
                    'sound/**/*',
                    'textures/**/*'
                ],
                createMultipleArchives: false,
                minFileCount: 10
            }
        }
    });

    $rootScope.$on('sessionStarted', function() {
        let {settings} = settingsService;
        if (settings.archiveCreation.initialized) return;
        Object.assign(settings.archiveCreation, {
            initialized: true,
            createTexturesArchive: gameService.appName === 'SSE' || gameService.appName === 'TES5VR',
            maxSize: (gameService.appName === 'FO4' || gameService.appName === 'FO4VR' ? 16 : 2) * GIGABYTE
        });
        settingsService.saveProfileSettings();
    });
});