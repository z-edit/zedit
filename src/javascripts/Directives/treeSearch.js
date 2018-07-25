ngapp.controller('treeSearchController', function($scope, $q, $timeout, progressService, hotkeyService, hotkeyFactory, errorService, nodeHelpers) {
    // helper variables
    let eKey = 69, fKey = 70, nKey = 78,
        searchOptionKeys = [fKey, eKey, nKey];

    // scope variables
    $scope.search = '';
    $scope.showExactMatch = true;
    $scope.searchOptions = { searchBy: 'Editor ID', exact: true };
    $scope.searchBy = ['Form ID', 'Editor ID', 'Name'];

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onSearchKeyDown', 'treeSearch');

    // helper functions
    let getElementIndex = function(elements, element) {
        return elements.findIndex(function(e) {
            return xelib.ElementEquals(e, element);
        });
    };

    let getSearchFiles = function(files, file, reverse, noOffset) {
        let startIndex = 0;
        if (file) {
            startIndex = getElementIndex(files, file);
            startIndex += noOffset ? 0 : (reverse ? -1 : 1);
        }
        files = files.slice(startIndex);
        if (reverse) return files.reverse();
        return files;
    };

    let getExactMatch = function(file, nodeIsFile, search, reverse) {
        let result = 0;
        xelib.WithHandles(xelib.GetElements(0, ''), function(files) {
            let searchFiles = getSearchFiles(files, file, reverse, nodeIsFile);
            searchFiles.find(function(file) {
                if ($scope.cancelled) return true;
                result = xelib.GetElement(file, search);
                return result > 0;
            });
        });
        return result;
    };

    let findExactMatch = function(search, reverse = false) {
        let action = $q.defer();
        $timeout(function() {
            let start = Date.now(),
                node = $scope.lastSelectedNode(),
                file = node && xelib.GetElementFile(node.handle),
                nodeIsFile = node && nodeHelpers.isFileNode(node),
                result = getExactMatch(file, nodeIsFile, search, reverse);
            console.log(`Search completed in ${Date.now() - start}ms`);
            action.resolve(result);
        }, 100);
        return action.promise;
    };

    let findPartialMatch = function(search, byName, reverse) {
        let action = $q.defer();
        $timeout(function() {
            let functionName = `Find${(reverse ? 'Previous' : 'Next')}Record`,
                node = $scope.lastSelectedNode(),
                handle = node ? node.handle : 0,
                result = xelib[functionName](handle, search, !byName, byName);
            action.resolve(result);
        }, 100);
        return action.promise;
    };

    let findElement = function(reverse) {
        let byName = $scope.searchOptions.searchBy === 'Name',
            search = $scope.search;
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
        errorService.try(() => $scope.navigateToElement(handle));
    };

    $scope.previousResult = function() {
        progressService.showProgress({ message: 'Searching...' });
        findElement(true).then(function(handle) {
            $scope.notFound = !handle;
            if (handle) $scope.foundResult(handle);
            progressService.hideProgress();
        });
    };

    $scope.nextResult = function() {
        progressService.showProgress({ message: 'Searching...' });
        findElement().then(function(handle) {
            $scope.notFound = !handle;
            if (handle) $scope.foundResult(handle);
            progressService.hideProgress();
        });
    };

    $scope.closeSearch = function() {
        if ($scope.handle) xelib.Release($scope.handle);
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
        $scope.searchOptions.searchBy = $scope.searchBy[n];
    };

    // event listeners
    $scope.$on('cancel', () => $scope.cancelled = true);

    $scope.$watch('searchOptions.searchBy', () => {
        let searchByFormId = $scope.searchOptions.searchBy === 'Form ID';
        if (searchByFormId) $scope.searchOptions.exact = true;
        $scope.searchOptions.disableExactMatch = searchByFormId;
    })
});
