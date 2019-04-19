ngapp.controller('editMergeLoadOrderController', function($rootScope, $scope, $timeout, mergeLoadService) {
    // helper functions
    let pluginInMerge = function(filename) {
        return !!$scope.merge.plugins.findByKey('filename', filename);
    };

    let getMasterNames = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        return plugin.masterNames.slice();
    };

    let buildLoadOrder = function() {
        $scope.loadOrder = $scope.merge.loadOrder.map(filename => ({
            filename: filename,
            masterNames: getMasterNames(filename),
            inMerge: pluginInMerge(filename)
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

    let getOutOfOrderMasters = function() {
        let filenames = [];
        return $scope.loadOrder.reduce((obj, entry) => {
            entry.masterNames.forEach(masterName => {
                if (filenames.includes(masterName)) return;
                if (!obj.hasOwnProperty(masterName))
                    obj[masterName] = [];
                obj[masterName].push(entry.filename);
            });
            filenames.push(entry.filename);
            return obj;
        }, {});
    };

    let updateOutOfOrderErrors = function() {
        let outOfOrderMasters = getOutOfOrderMasters();
        $scope.loadOrder.forEach(entry => {
            if (!outOfOrderMasters.hasOwnProperty(entry.filename)) return;
            entry.error = true;
            let mastersStr = outOfOrderMasters[entry.filename]
                .map(filename => `- ${filename}`)
                .join('\n');
            if (entry.title) entry.title += '\n';
            entry.title += 'Error: This plugin is loaded after plugins that require it:\n' + mastersStr;
        });
    };

    let notContiguous = function(entry) {
        entry.error = true;
        entry.title += 'Error: This plugin makes the merge not contiguous.';
    };

    let updateNotContiguousErrors = function() {
        if ($scope.merge.method !== 'Clobber') return;
        let mergeStarted = false;
        $scope.loadOrder.forEach(entry => {
            let inMerge = pluginInMerge(entry.filename);
            if (mergeStarted && !inMerge) notContiguous(entry);
            mergeStarted = mergeStarted || inMerge;
        });
    };

    let resetErrors = function() {
        $scope.loadOrder.forEach(entry => {
            entry.error = false;
            entry.title = '';
        });
    };

    let updateErrors = function() {
        resetErrors();
        updateNotContiguousErrors();
        updateOutOfOrderErrors();
    };

    // event handlers
    $scope.$watch('merge.useGameLoadOrder', () => {
        if (!$scope.merge.useGameLoadOrder) return;
        mergeLoadService.resetMergeLoadOrder($scope.merge);
        buildLoadOrder();
        updateIndexes();
        updateErrors();
    });

    $scope.$on('itemsReordered', function(e) {
        updateIndexes();
        updateLoadOrder();
        updateErrors();
        e.stopPropagation();
    });

    // initialization
    buildLoadOrder();
    updateIndexes();
    updateErrors();
});
