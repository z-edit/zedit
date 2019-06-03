ngapp.controller('manageExtensionsModalController', function($scope, extensionService, tabInterface) {
    $scope.tabs = extensionService.getTabs();
    tabInterface($scope);
});
