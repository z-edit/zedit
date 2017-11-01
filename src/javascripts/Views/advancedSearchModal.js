ngapp.controller('advancedSearchModalController', function($scope, searchService, filterFactory) {
    $scope.filterModes = ['and', 'or'];

    let defaultSearchScopes = {
        etMainRecord: 'Selected records',
        etGroupRecord: 'Current group',
        etFile: 'Current file',
        default: 'All files'
    };

    let getValidSearchScopes = function(node) {
        let searchScopes = ['All files'];
        if (node) {
            searchScopes.push('Current file');
            if (node.element_type !== xelib.etFile)
                searchScopes.push('Current group');
            if (node.element_type !== xelib.etGroupRecord)
                searchScopes.push('Selected records');
        }
        return searchScopes.concat(['Custom']);
    };

    let getSearchOptions = function() {
        return {
            nodes: $scope.modalOptions.nodes,
            scope: $scope.searchScope === 'Custom' ?
                $scope.customScope : $scope.searchScope,
            filterOptions: {
                mode: $scope.filterMode,
                filters: $scope.filters
            }
        };
    };

    let getCustomScopeFiles = function() {
        return xelib.GetLoadedFileNames().map(function(filename) {
            return {
                filename: filename,
                active: true
            }
        });
    };

    let getCustomScopeGroups = function() {
        let map = xelib.GetSignatureNameMap();
        return Object.keys(map).sort().map(function(signature) {
            return {
                signature: signature,
                name: map[signature],
                active: true
            }
        });
    };

    let createCustomScope = function() {
        $scope.customScope = {
            files: getCustomScopeFiles(),
            groups: getCustomScopeGroups()
        };
    };

    // scope functions
    $scope.search = function() {
        $scope.$root.$broadcast('searchResults', {
            results: searchService.search(getSearchOptions())
        });
        $scope.$emit('closeModal');
    };

    $scope.addFilter = function() {
        $scope.filters.push(filterFactory.filters.String());
    };

    $scope.searchScopeChanged = function() {
        if ($scope.searchScope !== 'Custom') return;
        createCustomScope();
        $scope.showCustomScopeTab = true;
    };

    $scope.onKeyDown = function(e) {
        if (!$scope.showCustomScopeTab) return;
        $scope.$broadcast('keyDown', e);
    };

    // initialization
    let node = $scope.modalOptions.nodes[0],
        elementType = node && xelib.elementTypes[node.element_type];

    $scope.searchScopes = getValidSearchScopes(node);
    $scope.searchScope = defaultSearchScopes[elementType || 'default'];
    $scope.filterMode = 'and';
    $scope.filters = [];
});
