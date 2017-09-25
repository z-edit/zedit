ngapp.controller('tabsModalController', function($scope, modalService) {
    $scope.tabs = [{
        label: 'First Tab',
        templateUrl: 'partials/tabsModal/firstTab.html',
        controller: 'firstTabController'
    }, {
        label: 'Second Tab',
        templateUrl: 'partials/tabsModal/secondTab.html',
        controller: 'secondTabController'
    }];

    modalService.initTabsModal($scope);
});
