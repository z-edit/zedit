ngapp.controller('editMergeLoadOrderController', function($scope, $timeout, mergeLoadService) {
    // helper functions
    let pluginInMerge = function(filename) {
        return !!$scope.merge.plugins.findByKey('filename', filename);
    };

    let buildLoadOrder = function() {
        $scope.loadOrder = $scope.merge.loadOrder.map(filename => ({
            filename: filename,
            active: pluginInMerge(filename)
        }));
    };

    let updateLoadOrder = function() {
        $scope.merge.loadOrder = $scope.loadOrder.mapOnKey('filename');
    };

    let updateIndexes = function() {
        $scope.$applyAsync(() => {
            let n = 0;
            $scope.loadOrder.forEach(entry => entry.index = n++);
        });
    };

    // event handlers
    $scope.$watch('merge.useGameLoadOrder', () => {
        if (!$scope.merge.useGameLoadOrder) return;
        mergeLoadService.resetMergeLoadOrder($scope.merge);
    });

    $scope.$on('itemsReordered', function(e) {
        $timeout(updateIndexes);
        updateLoadOrder();
        e.stopPropagation();
    });

    // initialization
    buildLoadOrder();
    updateIndexes();
});
