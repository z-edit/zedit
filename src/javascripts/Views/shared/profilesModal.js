ngapp.controller('profilesModalController', function ($scope, languageService, profileService) {
    // initialize scope variables
    $scope.games = xelib.games;
    $scope.languages = languageService.getLanguages();
    $scope.profiles = profileService.getProfiles();
    $scope.defaultProfile = profileService.getDefaultProfile();

    // scope functions
    $scope.addProfile = function() {
        $scope.profiles.push({
            name: profileService.getNewProfileName('New Profile'),
            gameMode: 3,
            gamePath: '',
            language: 'English',
            valid: false
        });
        if ($scope.defaultProfile) return;
        $scope.defaultProfile = $scope.profiles[0];
    };

    $scope.removeProfile = function(profile) {
        let index = $scope.profiles.indexOf(profile);
        $scope.profiles.splice(index, 1);
        if ($scope.profiles.length > 0) return;
        $scope.defaultProfile = undefined;
    };

    $scope.validateProfile = function(profile) {
        profileService.validateProfile(profile);
    };

    $scope.close = function() {
        profileService.setDefaultProfile($scope.defaultProfile);
        profileService.saveProfiles();
        $scope.$root.$broadcast('profilesUpdated');
        $scope.$emit('closeModal');
    };

    $scope.browse = function(profile) {
        let game = profileService.getGame(profile.gameMode),
            prompt = `Select your ${game.name} directory`,
            newGamePath = fh.selectDirectory(prompt, profile.gamePath);
        if (!newGamePath) return;
        profile.gamePath = fh.normalize(newGamePath);
        $scope.validateProfile(profile);
    };
});
