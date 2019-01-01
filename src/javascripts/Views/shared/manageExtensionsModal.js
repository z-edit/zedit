ngapp.controller('manageExtensionsModalController', function($scope, extensionService, tabService) {
    $scope.tabs = extensionService.getTabs();
    tabService.buildFunctions($scope);
});
