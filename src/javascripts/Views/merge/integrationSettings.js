ngapp.controller('integrationSettingsController', function($scope, $rootScope, settingsService) {
    $scope.gameMode = $rootScope.profile.gameMode;

    let browseTitles = {
        managerPath: 'Mod Manager Path',
        modsPath: 'Mod Manager Mods Path',
        decompilerPath: 'Papyrus Decompiler Path',
        compilerPath: 'Papyrus Compiler Path',
        papyrusFlagsPath: 'Papyrus Flags Path'
    };

    Object.keys(browseTitles).forEach(function(key) {
        settingsService.browseSettingsPath($scope, key, browseTitles[key]);
    });
});

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Integration Settings',
        customActions: true,
        appModes: ['merge'],
        templateUrl: 'partials/settings/integrations.html',
        defaultSettings: {
            modManager: 'None',
            managerPath: '',
            modsPath: '',
            decompilerPath: '',
            compilerPath: '',
            papyrusFlagsPath: ''
        }
    });
});