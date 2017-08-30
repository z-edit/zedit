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
    $scope.profileName = settingsService.currentProfile;
    $scope.tabs = settingsService.getTabs();
    $scope.currentTab = $scope.tabs[0];
    $scope.currentTab.selected = true;

    // scope functions
    $scope.onTabClick = function(e, tab) {
        e.stopPropagation();
        if (tab === $scope.currentTab) return;
        $scope.currentTab.selected = false;
        $scope.currentTab = tab;
        $scope.currentTab.selected = true;
    };

    $scope.saveSettings = function() {
        settingsService.saveSettings($scope.settings);
        $scope.toggleSettingsModal();
    };
});
