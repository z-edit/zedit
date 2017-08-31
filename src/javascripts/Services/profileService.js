ngapp.service('profileService', function() {
    var service = this;

    this.games = fh.loadResource('app/games.json');
    this.profiles = fh.loadJsonFile('profiles.json');
    this.languages = ['English'];

    this.saveProfiles = function() {
        let sanitizedProfiles = service.profiles.map(function(profile) {
            return {
                name: profile.name,
                gameMode: profile.gameMode,
                gamePath: profile.gamePath || '',
                language: profile.language
            };
        });
        fh.saveJsonFile('profiles.json', sanitizedProfiles);
    };

    this.newProfileName = function(name) {
        let counter = 2;
        let profileName = name;
        let existingProfile;
        do {
            if (existingProfile) {
                profileName = `${name} ${counter}`;
                counter++;
            }
            existingProfile = service.profiles.find(function(profile) {
                return profile.name === profileName;
            });
        } while (existingProfile);
        return profileName;
    };

    this.createProfile = function(game, gamePath) {
        return {
            name: service.newProfileName(game.name),
            gameMode: game.mode,
            gamePath: gamePath,
            language: 'English'
        }
    };

    this.detectMissingProfiles = function() {
        service.games.forEach(function(game) {
            let gameProfile = service.profiles.find(function(profile) {
                return profile.gameMode == game.mode;
            });
            if (gameProfile) return;
            let gamePath = xelib.GetGamePath(game.mode);
            if (gamePath !== '') {
                service.profiles.push(service.createProfile(game, gamePath));
            }
        });
    };

    this.getDefaultProfile = function() {
        return service.profiles.find(function(profile) { return profile.valid });
    };

    this.setDefaultProfile = function(defaultProfile) {
        if (!defaultProfile) return;
        let n = service.profiles.indexOf(defaultProfile);
        if (n == 0) return;
        service.profiles.splice(n, 1);
        service.profiles.unshift(defaultProfile);
    };

    this.getGame = function(gameMode) {
        return service.games.find(function (game) {
            return game.mode == gameMode;
        });
    };

    this.validateProfile = function(profile) {
        let game = service.getGame(profile.gameMode);
        profile.valid = fh.jetpack.exists(profile.gamePath + game.exeName);
    };

    this.validateProfiles = function() {
        service.profiles.forEach(service.validateProfile);
    };

    this.detectMissingProfiles();
});
