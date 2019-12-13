ngapp.directive('itemFilters', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/itemFilters.html',
        controller: 'itemFiltersController'
    };
});

ngapp.controller('itemFiltersController', function($scope, $timeout) {
    let updateDelay = 500,
        updateTimeout = null;

    $scope.activeFilters = [];

    $scope.toggleFilter = function(filter) {
        let fnName = filter.enabled ? 'remove' : 'push';
        filter.enabled = !filter.enabled;
        $scope.activeFilters[fnName](filter);
        $scope.filtersChanged();
    };

    $scope.filtersChanged = function() {
        if (updateTimeout) $timeout.cancel(updateTimeout);
        updateTimeout = $timeout($scope.updateItems, updateDelay);
    };
});
