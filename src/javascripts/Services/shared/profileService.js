ngapp.service('profileService', function($rootScope, settingsService, xelibService) {
    let service = this,
        profilesPath = fh.path(fh.userPath, 'profiles.json'),
        profiles = fh.loadJsonFile(profilesPath) || [];

    // helper functions
    let getProfile = name => profiles.findByKey('name', name);

    // public api
    this.getNewProfileName = function(name) {
        let counter = 2,
            profileName = name;
        while (getProfile(profileName))
            profileName = `${name} ${counter++}`;
        return profileName;
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
            language: 'English'
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

    this.getGame = function(gameMode) {
        return xelib.games.findByKey('mode', gameMode);
    };

    this.validateProfile = function(profile) {
        let game = service.getGame(profile.gameMode),
            exePath = fh.path(profile.gamePath, game.exeName);
        profile.valid = fh.jetpack.exists(exePath) === 'file';
    };

    this.validateProfiles = function() {
        profiles.forEach(service.validateProfile);
    };

    this.getProfiles = function() {
        return profiles.filterOnKey('valid');
    };

    this.selectProfile = function(selectedProfile) {
        settingsService.loadProfileSettings(selectedProfile.name);
        $rootScope.profile = selectedProfile;
        xelibService.startSession(selectedProfile);
    };

    this.detectMissingProfiles();
});
