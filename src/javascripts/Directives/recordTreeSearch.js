ngapp.controller('recordTreeSearchController', function($scope, $q, $timeout, hotkeyService, hotkeyFactory) {
    // helper variables
    let pKey = 80, vKey = 86,
        searchOptionKeys = [pKey, vKey];

    // scope variables
    $scope.search = '';
    $scope.searchOptions = { searchBy: "1", exact: true };
    $scope.searchBy = {
        0: "Path",
        1: "Value"
    };

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onSearchKeyDown', 'treeSearch');

    // scope functions
    $scope.foundResult = function(handle) {
        // TODO
    };

    $scope.previousResult = function() {
        // TODO
    };

    $scope.nextResult = function() {
        // TODO
    };

    $scope.closeSearch = function() {
        $scope.toggleSearchBar();
    };

    $scope.blurSearch = function() {
        $scope.notFound = false;
    };

    $scope.toggleExact = function() {
        $scope.searchOptions.exact = !$scope.searchOptions.exact;
    };

    $scope.setSearchBy = function(e) {
        let n = searchOptionKeys.indexOf(e.keyCode);
        if (n === -1) return;
        $scope.searchOptions.searchBy = n.toString();
    };

    // event listeners
    $scope.$on('cancel', () => $scope.cancelled = true);
});
