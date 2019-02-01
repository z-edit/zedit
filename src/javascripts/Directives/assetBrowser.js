ngapp.directive('assetBrowser', function() {
    return {
        restrict: 'E',
        scope: {
            folder: '@',
            onSelect: '=',
            onDoubleClick: '=',
            itemsPerRow: '@'
        },
        controller: 'assetBrowserController',
        templateUrl: 'directives/assetBrowser.html'
    }
});

ngapp.controller('assetBrowserController', function($scope, fileTreeService, hotkeyService) {
    let {getFileTree, resolvePath} = fileTreeService,
        tree = getFileTree($scope.folder);

    // default values
    if (!$scope.itemPerRow) $scope.itemsPerRow = 4;

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onPathKeyDown', 'assetBrowser');

    // scope functions
    $scope.go = function(path) {
        try {
            $scope.currentFolder = resolvePath(tree, path);
            $scope.path = tree.currentPath = path;
            $scope.atRoot = path === '';
            $scope.notFound = false;
        } catch (x) {
            console.log(x);
            $scope.notFound = true;
        }
    };

    $scope.onPathBlur = function() {
        $scope.notFound = false;
        $scope.path = tree.currentPath.slice();
    };

    $scope.upLevel = function() {
        if ($scope.atRoot) return;
        $scope.path = fh.getDirectory($scope.path);
        $scope.go($scope.path);
    };

    $scope.close = () => $scope.$emit('close');

    // event handlers
    $scope.$watch('currentFolder', function() {
        $scope.rows = [];
        let row = null,
            items = $scope.currentFolder.children;
        for (let i = 0; i < items.length; i++) {
            if (i % $scope.itemsPerRow === 0) {
                if (row) $scope.rows.push(row);
                row = [];
            }
            row.push(items[i]);
        }
    });

    // initialization
    $scope.go(tree.currentPath || '');
    if ($scope.notFound) $scope.go('');
});
