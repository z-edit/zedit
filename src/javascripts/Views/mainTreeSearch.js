ngapp.controller('mainTreeSearchController', function($scope, $q, $timeout, xelibService) {
    // helper variables
    let enterKey = 13;
    let escapeKey = 27;
    let aKey = 65;
    let eKey = 69;
    let fKey = 70;
    let nKey = 78;
    let xKey = 88;
    let searchOptionKeys = [fKey, eKey, nKey, aKey];

    // scope variables
    $scope.search = '';
    $scope.searchOptions = {
        searchBy: "1",
        exact: true
    };
    $scope.searchBy = {
        0: "Form ID",
        1: "Editor ID",
        2: "Name"
    };

    // helper functions
    let findNextMatch = function(search) {
        let action = $q.defer();
        $timeout(function() {
            let start = Date.now(),
                result = 0,
                currentNode = $scope.lastSelectedNode(),
                currentFile = currentNode && xelib.GetElementFile(currentNode.handle);
            xelibService.withElements(0, '', function(files) {
                let currentFileIndex = currentFile ? files.findIndex(function(file) {
                    return xelib.ElementEquals(file, currentFile);
                }) : -1;
                if (currentNode && currentNode.element_type == xelib.etFile) currentFileIndex--;
                for (let i = currentFileIndex + 1; i < files.length; i++) {
                    if ($scope.cancelled) return;
                    result = xelib.GetElement(files[i], search, true);
                    if (result) return;
                }
            });
            console.log(`Search completed in ${Date.now() - start}ms`);
            action.resolve(result);
        }, 100);
        return action.promise;
    };

    let findNextElement = function(search, options) {
        if (options.exact) {
            return findNextMatch(options.searchBy == 2 ? `"${search}"` : search);
        } else {
            // TODO
        }
    };

    // scope functions
    $scope.previousResult = function() {
        // TODO
    };

    $scope.nextResult = function() {
        $scope.$emit('loading', 'Searching...', true);
        findNextElement($scope.search, $scope.searchOptions).then(function(handle) {
            if (handle) {
                if ($scope.handle) xelib.Release($scope.handle);
                $scope.handle = handle;
                $scope.navigateToElement(handle);
            }
            $scope.$emit('doneLoading');
        });
    };

    $scope.closeSearch = function() {
        if ($scope.handle) xelib.Release($scope.handle);
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