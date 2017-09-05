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

    // helper function
    let selectTab = function(tab) {
        $scope.tabs.forEach((tab) => tab.selected = false);
        $scope.currentTab = tab;
        $scope.currentTab.selected = true;
    };

    // initialize scope variables
    $scope.settings = settingsService.settings;
    $scope.globalSettings = settingsService.globalSettings;
    $scope.profileName = settingsService.currentProfile;
    $scope.tabs = settingsService.getTabs();
    selectTab($scope.tabs[0]);

    // scope functions
    $scope.onTabClick = function(e, tab) {
        e.stopPropagation();
        if (tab === $scope.currentTab) return;
        selectTab(tab);
    };

    $scope.saveSettings = function() {
        settingsService.saveSettings();
        $scope.toggleSettingsModal();
    };
});
