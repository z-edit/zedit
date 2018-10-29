ngapp.controller('advancedSearchModalController', function($scope, searchService, filterFactory) {
    let validSearchScopes = {
        etFile: ['All files', 'Selected files', 'Custom'],
        etGroupRecord: ['All files', 'Selected files', 'Selected groups', 'Custom'],
        etMainRecord: ['All files', 'Selected files', 'Selected groups', 'Selected records', 'Custom'],
        default: ['All files', 'Custom']
    };

    let prepareNodes = function() {
        return $scope.modalOptions.nodes.map(function(node) {
            return {
                handle: xelib.GetElementEx(node.handle),
                element_type: node.element_type
            }
        });
    };

    let getSearchScope = function() {
        if ($scope.searchScope === 'Custom') return $scope.customScope;
        return $scope.searchScope;
    };

    let getSearchOptions = function() {
        return {
            nodes: prepareNodes(),
            scope: getSearchScope(),
            filterOptions: {
                mode: $scope.filterMode,
                filters: $scope.filters
            }
        };
    };

    let getCustomScopeFiles = function() {
        return xelib.GetLoadedFileNames().map(filename => ({
            filename: filename,
            active: true
        }));
    };

    let getCustomScopeGroups = function() {
        let map = xelib.GetSignatureNameMap();
        return Object.keys(map).sort().map(signature => ({
            signature: signature,
            name: map[signature],
            active: true
        }));
    };

    let createCustomScope = function() {
        $scope.customScope = {
            files: getCustomScopeFiles(),
            groups: getCustomScopeGroups()
        };
    };

    let setSearchScope = function(searchScope) {
        let searchScopes = $scope.searchScopes;
        if (!searchScope) {
            $scope.searchScope = searchScopes[searchScopes.length - 2];
        } else if (typeof searchScope === 'string') {
            $scope.searchScope = searchScope;
        } else {
            $scope.searchScope = 'Custom';
            $scope.customScope = searchScope;
        }
    };

    // scope functions
    $scope.search = function() {
        let searchOptions = getSearchOptions();
        $scope.$root.$broadcast('searchResults', {
            results: searchService.search(searchOptions),
            searchOptions: searchOptions
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
    let nodes = $scope.modalOptions.nodes,
        node = nodes[0],
        filterOptions = $scope.modalOptions.filterOptions,
        elementType = node && xelib.elementTypes[node.element_type];

    $scope.searchScopes = validSearchScopes[elementType || 'default'];
    setSearchScope($scope.modalOptions.scope);
    $scope.filterMode = filterOptions ? filterOptions.mode : 'and';
    $scope.filters = filterOptions ? filterOptions.filters : [];
});
