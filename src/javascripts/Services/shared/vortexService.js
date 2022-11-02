ngapp.service('vortexService', function($rootScope, fileSearchService, gameService) {
    let service = this;

    this.getModManagerPath = function() {
        let exePath = fileSearchService.findFile(/^Vortex\.exe$/, {
            initialQueue: [
                process.env.USERPROFILE,
                `${process.env.USERPROFILE}\\My Documents`,
                `${process.env.USERPROFILE}\\Desktop`
            ].map(path => ({ path, priority: 2 })),
            prioritize: [/vortex/i, /gam(e|ing)/i, /program/i, /mod/i, /tool/i,
                /steam/i, /^common$/, /(Skyrim|Fallout|Oblivion)/i]
        });
        return exePath ? fh.getDirectory(exePath) : '';
    };

    this.getModsPath = function() {
        let game = gameService.getGame($rootScope.profile.gameMode),
            gameName = game.shortName,
            documentsPath = `${process.env.USERPROFILE}\\My Documents`,
            modsPath = `${documentsPath}\\mods\\${gameName}`;
        return fh.jetpack.exists(modsPath) ? modsPath : '';
    };

    this.detect = function(settings) {
        settings.managerPath = service.getModManagerPath();
        settings.modsPath = service.getModsPath();
        return settings.managerPath !== '';
    };
});
