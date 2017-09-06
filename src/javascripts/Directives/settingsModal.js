ngapp.controller('settingsModalController', function($scope, modalService, settingsService) {
    // inherited functions
    modalService.buildUnfocusModalFunction($scope, 'saveSettings');

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
        $scope.$emit('closeModal');
    };
});
