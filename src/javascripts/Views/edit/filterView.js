ngapp.controller('filterViewController', function($scope, viewFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // prepare tree view
    $scope.treeView = viewFactory.newView('treeView');
    $scope.treeView.filter = true;

    // initialize scope label
    let labels = $scope.view.searchOptions.scopeLabel;
    if (labels.long.length < 30) {
        $scope.scopeLabel = labels.long;
    } else {
        $scope.scopeLabel = labels.short;
        $scope.scopeTooltip = labels.long.wordwrap(80);
    }

    // scope functions
    $scope.rerunSearch = function() {
        let options = $scope.view.searchOptions;
        $scope.$emit('openModal', 'advancedSearch', options);
    };

    $scope.$watch('view.results', function(oldVal, newVal) {
        if (oldVal && newVal) $scope.$broadcast('reloadGUI');
    })
});
