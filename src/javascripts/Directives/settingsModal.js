ngapp.directive('settingsModal', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/settingsModal.html',
        controller: 'settingsModalController',
        scope: false
    }
});

ngapp.controller('settingsModalController', function($scope, formUtils, settingsService) {
    // inherited functions
    $scope.unfocusSettingsModal = formUtils.unfocusModal($scope.saveSettings);

    // initialize scope variables
    $scope.settings = settingsService.settings;
    $scope.profileName = settingsService.currentProfile.name;

    // scope functions
    $scope.saveSettings = function() {
        settingsService.saveSettings($scope.settings);
        $scope.toggleSettingsModal();
    };
});
