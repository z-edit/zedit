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
    let filtersPath = fh.jetpack.dir('filters').path(),
        jsonFileTypeFilter = { name: 'JSON File', extensions: ['json'] };

    $scope.groupModes = ['and', 'or'];
    $scope.filterTypes = Object.keys(filterFactory.filters);

    let exportGroup = function(filter) {
        return {
            type: 'Group',
            mode: filter.mode,
            children: exportFilters(filter.children)
        }
    };

    let exportFilter = function(filter) {
        return filter.exportKeys.reduce((obj, key) => {
            obj[key] = filter[key];
            return obj;
        }, { type: filter.type })
    };

    let exportFilters = function(filters) {
        return filters.map(filter => {
            let exportFn = filter.type === 'Group' ? exportGroup : exportFilter;
            return exportFn(filter);
        });
    };

    let importGroup = function(base, filter) {
        return Object.assign(base, {
            mode: filter.mode,
            children: importFilters(filter.children)
        });
    };

    let importFilter = function(base, filter) {
        return Object.assign(base, filter);
    };

    let importFilters = function(filters) {
        return filters.map(filter => {
            let baseFilter = filterFactory.filters[filter.type]();
            return filter.type === 'Group' ?
                importGroup(baseFilter, filter) :
                importFilter(baseFilter, filter);
        });
    };

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

    $scope.exportFilters = function() {
        let outputPath = fh.saveFile('Export filters', filtersPath, [
            jsonFileTypeFilter
        ]);
        if (!outputPath) return;
        fh.saveJsonFile(outputPath, exportFilters($scope.filters));
    };

    $scope.importFilters = function() {
        let inputPath = fh.selectFile('Import filters', filtersPath, [
            jsonFileTypeFilter
        ]);
        if (!inputPath) return;
        $scope.filters = importFilters(fh.loadJsonFile(inputPath));
    };

    $scope.$on('importFilters', function(e) {
        if (e.defaultPrevented) return;
        $scope.importFilters();
        e.preventDefault();
    });

    $scope.$on('exportFilters', function(e) {
        if (e.defaultPrevented) return;
        $scope.exportFilters();
        e.preventDefault();
    });
});
