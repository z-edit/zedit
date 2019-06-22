ngapp.service('profileService', function($rootScope, settingsService, xelibService) {
    let service = this,
        profilesPath = fh.path(fh.userPath, 'profiles.json'),
        profiles;

    // helper functions
    let getProfile = name => profiles.findByKey('name', name);

    let getDefaultBackground = game => {
        let imagesDir = fh.appDir.cwd('app', 'images'),
            backgroundPath = imagesDir.path('backgrounds', `${game.name}.jpg`)
        return { url: fh.pathToFileUrl(backgroundPath) };
    };

    let getGame = function(gameMode) {
        return xelib.games.findByKey('mode', gameMode);
    };

    // public api
    this.validateProfile = function(profile) {
        let game = getGame(profile.gameMode),
            exePath = fh.path(profile.gamePath, game.exeName);
        profile.valid = fh.jetpack.exists(exePath) === 'file';
    };

    this.getNewProfileName = function(name) {
        let counter = 2,
            profileName = name;
        while (getProfile(profileName))
            profileName = `${name} ${counter++}`;
        return profileName;
    };

    this.loadProfiles = function() {
        profiles = fh.loadJsonFile(profilesPath) || [];
        profiles.forEach(profile => {
            service.validateProfile(profile);
            if (profile.background) return;
            let game = xelib.games[profile.gameMode];
            profile.background = getDefaultBackground(game);
        });
    };

    this.saveProfiles = function() {
        let sanitizedProfiles = profiles.map(profile => ({
            name: profile.name,
            gameMode: profile.gameMode,
            gamePath: profile.gamePath || '',
            language: profile.language
        }));
        fh.saveJsonFile(profilesPath, sanitizedProfiles);
    };

    this.createProfile = function(game, gamePath) {
        return {
            name: service.getNewProfileName(game.name),
            gameMode: game.mode,
            gamePath: gamePath,
            language: 'English',
            background: getDefaultBackground(game)
        }
    };

    this.detectMissingProfiles = function() {
        xelib.games.forEach(game => {
            let gameProfile = profiles.findByKey('gameMode', game.mode);
            if (gameProfile) return;
            let gamePath = xelib.GetGamePath(game.mode);
            if (gamePath === '') return;
            profiles.push(service.createProfile(game, gamePath));
        });
    };

    this.getDefaultProfile = function() {
        return profiles.findByKey('valid', true);
    };

    this.setDefaultProfile = function(defaultProfile) {
        if (!defaultProfile) return;
        let n = profiles.indexOf(defaultProfile);
        if (n === 0) return;
        profiles.splice(n, 1);
        profiles.unshift(defaultProfile);
    };

    this.getProfiles = function(includeInvalid) {
        return profiles.filter(p => includeInvalid || p.valid);
    };

    this.selectProfile = function(selectedProfile) {
        settingsService.loadProfileSettings(selectedProfile.name);
        $rootScope.profile = selectedProfile;
        xelibService.startSession(selectedProfile);
    };
});
