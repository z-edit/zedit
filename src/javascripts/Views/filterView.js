ngapp.controller('filterViewController', function($scope, viewFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // prepare tree view
    $scope.treeView = viewFactory.newView('treeView');
    $scope.treeView.filter = true;

    // scope functions
    $scope.rerunSearch = function() {
        // TODO
    };
});
