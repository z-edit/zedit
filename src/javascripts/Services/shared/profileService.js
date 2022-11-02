ngapp.service('profileService', function($rootScope, settingsService, xelibService, gameService) {
    let service = this,
        profilesPath = fh.path(fh.userPath, 'profiles.json'),
        localesPath = fh.path(fh.appPath, 'locales.json');

    this.profiles = fh.loadJsonFile(profilesPath) || [];
    this.locales = fh.loadJsonFile(localesPath) || {};
    this.languages = ['English', 'French', 'German', 'Italian', 'Spanish',
        'Russian', 'Polish', 'Japanese', 'Portugese', 'Chinese'];

    // helper functions
    let getProfile = name => service.profiles.findByKey('name', name);

    let getSystemLanguage = function() {
        let localeLanguage = service.locales[window.locale];
        return localeLanguage.replace(/\s\([^\)]+\)/, '');
    };

    let getDefaultLanguage = function() {
        let systemLanguage = getSystemLanguage(),
            languageSupported = service.languages.includes(systemLanguage);
        return languageSupported ? systemLanguage : 'English';
    };

    // public api
    this.getNewProfileName = function(name) {
        let counter = 2,
            profileName = name;
        while (getProfile(profileName))
            profileName = `${name} ${counter++}`;
        return profileName;
    };

    this.saveProfiles = function() {
        let sanitizedProfiles = service.profiles.map(profile => ({
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
            let gameProfile = service.profiles.find(profile => {
                return profile.gameMode === game.mode;
            });
            if (gameProfile) return;
            let gamePath = xelib.GetGamePath(game.mode);
            if (gamePath !== '') {
                service.profiles.push(service.createProfile(game, gamePath));
            }
        });
    };

    this.getDefaultProfile = function() {
        return service.profiles.findByKey('valid', true);
    };

    this.setDefaultProfile = function(defaultProfile) {
        if (!defaultProfile) return;
        let n = service.profiles.indexOf(defaultProfile);
        if (n === 0) return;
        service.profiles.splice(n, 1);
        service.profiles.unshift(defaultProfile);
    };

    this.validateProfile = function(profile) {
        let game = gameService.getGame(profile.gameMode),
            exePath = fh.path(profile.gamePath, game.exeName);
        profile.valid = fh.jetpack.exists(exePath) === 'file';
    };

    this.validateProfiles = function() {
        service.profiles.forEach(service.validateProfile);
    };

    this.selectProfile = function(selectedProfile) {
        settingsService.loadProfileSettings(selectedProfile.name);
        $rootScope.profile = selectedProfile;
        xelibService.startSession(selectedProfile);
    };

    this.detectMissingProfiles();
});
