ngapp.controller('tabsModalController', function($scope, tabInterface) {
    $scope.tabs = [{
        label: 'First Tab',
        templateUrl: 'partials/tabsModal/firstTab.html',
        controller: 'firstTabController'
    }, {
        label: 'Second Tab',
        templateUrl: 'partials/tabsModal/secondTab.html',
        controller: 'secondTabController'
    }];

    tabInterface($scope);
});
