ngapp.controller('copyIntoModalController', function($scope) {
    let newPluginItem = {
        filename: '< new file >',
        active: false
    };

    // helper functions
    let getMaxLoadOrder = function() {
        let maxLoadOrder = -1;
        $scope.modalOptions.nodes.forEach(function(node) {
            xelib.WithHandle(xelib.GetElementFile(node.handle), function(file) {
                maxLoadOrder = Math.max(maxLoadOrder, xelib.GetFileLoadOrder(file));
            });
        });
        return maxLoadOrder;
    };

    let getPluginObjects = function() {
        let plugins = [];
        xelib.WithEachHandle(xelib.GetElements(), function(file) {
            if (!xelib.GetIsEditable(file)) return;
            plugins.push({
                filename: xelib.Name(file),
                loadOrder: xelib.GetFileLoadOrder(file),
                active: false
            });
        });
        return plugins;
    };

    let initPlugins = function() {
        let plugins = getPluginObjects();
        if ($scope.asOverride) {
            let maxLoadOrder = getMaxLoadOrder();
            plugins = plugins.filter(function(plugin) {
                return plugin.loadOrder > maxLoadOrder;
            });
        }
        $scope.plugins = plugins.concat(newPluginItem);
    };

    let getActiveFileNames = function() {
        return $scope.plugins.filter(function(plugin) {
            return plugin.active;
        }).map(function(plugin) {
            return plugin.filename;
        });
    };

    // scope functions
    $scope.copy = function() {
        $scope.modalOptions.action.resolve({
            filenames: getActiveFileNames(),
            asOverride: $scope.asOverride,
            smartCopy: $scope.smartCopy
        });
        $scope.$emit('closeModal');
    };

    $scope.cancel = function() {
        $scope.modalOptions.action.reject();
        $scope.$emit('closeModal');
    };

    // initialization
    $scope.$watch('asOverride', function() {
        $scope.smartCopy = !$scope.asOverride;
        initPlugins();
    });

    let typeLabels = {
            etGroupRecord: 'group',
            etMainRecord: 'record'
        },
        count = $scope.modalOptions.nodes.length,
        elementType = $scope.modalOptions.nodes[0].element_type,
        typeLabel = typeLabels[xelib.elementTypes[elementType]];

    $scope.label = `${count} ${typeLabel}${count > 1 ? 's' : ''}`;
    $scope.asOverride = true;
});
