ngapp.controller('manageExtensionsModalController', function($scope, extensionService, modalService) {
    $scope.tabs = extensionService.getTabs();
    modalService.initTabsModal($scope);
});
