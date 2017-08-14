ngapp.controller('recordTreeSearchController', function($scope, $q, $timeout, xelibService) {
    // helper variables
    let enterKey = 13;
    let escapeKey = 27;
    let pKey = 80;
    let vKey = 86;
    let xKey = 88;
    let searchOptionKeys = [pKey, vKey];

    // scope variables
    $scope.search = '';
    $scope.searchOptions = {
        searchBy: "1",
        exact: true
    };
    $scope.searchBy = {
        0: "Path",
        1: "Value"
    };

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
        $scope.toggleSearch();
    };

    // keydown in the search field
    $scope.searchKeyDown = function(e) {
        if (e.keyCode == enterKey) {
            $scope[(e.shiftKey ? 'previous' : 'next') + 'Result']();
        } else if (e.keyCode == escapeKey) {
            $scope.closeSearch();
        } else if (e.altKey) {
            if (e.keyCode == xKey) {
                $scope.searchOptions.exact = !$scope.searchOptions.exact;
            } else {
                let n = searchOptionKeys.indexOf(e.keyCode);
                if (n == -1) return;
                $scope.searchOptions.searchBy = n;
            }
        } else {
            return;
        }
        e.stopPropagation();
        e.preventDefault();
    };

    // event listeners
    $scope.$on('cancel', function() {
        $scope.cancelled = true;
    });
});