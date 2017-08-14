ngapp.controller('mainTreeSearchController', function($scope, $q, $timeout) {
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
    let getElementIndex = function(elements, element) {
        return elements.findIndex(function(e) {
            return xelib.ElementEquals(e, element);
        });
    };

    let getStartIndex = function(files, file, reverse, noOffset) {
        if (file) {
            return getElementIndex(files, file) + noOffset ? 0 : (reverse ? -1 : 1);
        } else {
            return reverse ? files.length : 0;
        }
    };

    let findExactMatch = function(search, reverse = false) {
        let action = $q.defer();
        $timeout(function() {
            let start = Date.now(),
                result = 0,
                currentNode = $scope.lastSelectedNode(),
                currentFile = currentNode && xelib.GetElementFile(currentNode.handle),
                currentNodeIsFile = currentNode.element_type === xelib.etFile;
            xelib.WithHandles(xelib.GetElements(0, ''), function(files) {
                let startIndex = getStartIndex(files, currentFile, reverse, currentNodeIsFile);
                for (let i = startIndex; i >= 0 && i < files.length; reverse ? i-- : i++) {
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

    let findPartialMatch = function(search, byName, reverse) {
        let action = $q.defer();
        $timeout(function() {
            let functionName = `Find${(reverse ? 'Previous' : 'Next')}Record`;
            let node = $scope.lastSelectedNode();
            let handle = node ? node.handle : 0;
            let result = xelib[functionName](handle, search, !byName, byName, true);
            action.resolve(result);
        }, 100);
        return action.promise;
    };

    let findElement = function(reverse) {
        let byName = $scope.searchOptions.searchBy == 2;
        let search = $scope.search;
        // search by FormID is always exact
        if ($scope.searchOptions.exact) {
            // search by FormID uses the same syntax as search by EditorID
            return findExactMatch(byName ? `"${search}"` : search, reverse);
        } else {
            return findPartialMatch(search, byName, reverse);
        }
    };

    // scope functions
    $scope.foundResult = function(handle) {
        if ($scope.handle) xelib.Release($scope.handle);
        $scope.handle = handle;
        $scope.navigateToElement(handle);
    };

    $scope.previousResult = function() {
        $scope.$emit('loading', 'Searching...');
        findElement(true).then(function(handle) {
            handle && $scope.foundResult(handle);
            $scope.$emit('doneLoading');
        });
    };

    $scope.nextResult = function() {
        $scope.$emit('loading', 'Searching...');
        findElement().then(function(handle) {
            handle && $scope.foundResult(handle);
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