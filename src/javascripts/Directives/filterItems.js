ngapp.directive('filterItems', function() {
    return {
        restrict: 'E',
        scope: {
            filters: '='
        },
        templateUrl: 'directives/filterItems.html',
        controller: 'filterItemsController'
    }
});

ngapp.controller('filterItemsController', function($scope, filterFactory) {
    $scope.groupModes = ['and', 'or'];
    $scope.filterTypes = Object.keys(filterFactory.filters);

    $scope.filterTypeChanged = function(filter) {
        let newFilter = filterFactory.filters[filter.type](filter.path),
            index = $scope.filters.indexOf(filter);
        $scope.filters.splice(index, 1, newFilter);
    };

    $scope.addChildFilter = function(filter) {
        filter.children.push(filterFactory.filters.String())
    };

    $scope.removeFilter = function(index) {
        $scope.filters.splice(index, 1);
    };
});
