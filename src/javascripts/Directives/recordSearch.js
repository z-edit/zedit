ngapp.controller('recordSearchController', function($scope, $q, $timeout, hotkeyInterface) {
    // helper variables
    let pKey = 80, vKey = 86,
        searchOptionKeys = [pKey, vKey];

    // scope variables
    $scope.search = '';
    $scope.showExactMatch = false;
    $scope.searchOptions = { searchBy: 'Value' };
    $scope.searchBy = ['Path', 'Value'];

    // inherited functions
    hotkeyInterface($scope, 'onSearchKeyDown', 'recordSearch');

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

    $scope.setSearchBy = function(e) {
        let n = searchOptionKeys.indexOf(e.keyCode);
        if (n === -1) return;
        $scope.searchOptions.searchBy = n.toString();
    };

    // event listeners
    $scope.$on('cancel', () => $scope.cancelled = true);
});
