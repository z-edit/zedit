ngapp.controller('loadOrderModalController', function ($scope, $state) {
    // helper variables
    let disabledTitle = 'This plugin cannot be loaded because it requires plugins \r\n' +
        'which are unavailable or cannot be loaded:',
        requiredTitle = 'This plugin is required by the following active plugins:',
        opts = $scope.modalOptions;

    // scope functions
    $scope.findItem = function(filename) {
        return opts.loadOrder.find(function(item) {
            return item.filename === filename && !item.disabled;
        });
    };

    $scope.getRequiredBy = function(filename) {
        return opts.loadOrder.filter(function(item) {
            return item.masterNames.includes(filename);
        });
    };

    $scope.buildTitle = function(title, filenames) {
        if (filenames.length === 0) return '';
        filenames.slice(0, 10).forEach((filename) => title += `\r\n  - ${filename}`);
        if (filenames.length > 10) title += '\r\n  - etc.';
        return title;
    };

    $scope.disablePlugin = function(item) {
        let missingMasters = item.masterNames.filter(function(masterName, index) {
            return !item.masters[index];
        });
        item.active = false;
        item.disabled = true;
        item.title = $scope.buildTitle(disabledTitle, missingMasters);
        $scope.disableRequiredBy(item);
    };

    $scope.updateRequired = function(item) {
        if (!item.active) return;
        let activeRequiredBy = item.requiredBy.
            filter((item) => { return item.active; }).
            map((item) => { return item.filename; });
        item.required = activeRequiredBy.length > 0;
        item.title = $scope.buildTitle(requiredTitle, activeRequiredBy);
    };

    $scope.activatePlugin = function(item) {
        item.active = true;
        $scope.enableMasters(item);
        item.masters.forEach($scope.updateRequired);
    };

    $scope.deactivatePlugin = function(item) {
        item.active = false;
        item.required = false;
        item.title = '';
        $scope.disableRequiredBy(item);
        item.masters.forEach($scope.updateRequired);
    };

    $scope.enableMasters = function(item) {
        item.masters.forEach(function(masterItem) {
            if (!masterItem.active) $scope.activatePlugin(masterItem);
        });
    };

    $scope.disableRequiredBy = function(item) {
        item.requiredBy.forEach(function(requiredItem) {
            if (requiredItem.active) $scope.deactivatePlugin(requiredItem);
        });
    };

    $scope.updateIndexes = function() {
        let n = 0;
        opts.loadOrder.forEach(function(item) {
            if (item.active) item.index = n++;
        });
    };

    $scope.loadPlugins = function() {
        let loadOrder = opts.loadOrder.
            filter((item) => { return item.active; }).
            map((item) => { return item.filename;  });
        console.log("Loading: \n" + loadOrder);
        xelib.ClearMessages();
        xelib.LoadPlugins(loadOrder.join('\n'));
        $scope.$emit('closeModal');
        $state.go('base.main');
    };

    $scope.itemToggled = function(item) {
        item.active ? $scope.enableMasters(item) : $scope.disableRequiredBy(item);
        if (!item.active) {
            item.required = false;
            item.title = '';
        }
        item.masters.forEach($scope.updateRequired);
        $scope.updateIndexes();
    };

    $scope.buildMasterData = function() {
        opts.loadOrder.forEach(function(item) {
            item.masters = item.masterNames.map(function(masterName) {
                return $scope.findItem(masterName);
            });
            item.requiredBy = $scope.getRequiredBy(item.filename);
            if (item.masters.includes(undefined)) {
                $scope.disablePlugin(item);
            } else if (item.active) {
                $scope.enableMasters(item);
            }
        });
    };

    $scope.updateItems = function() {
        opts.loadOrder.forEach(function(item) {
            if (item.active) $scope.updateRequired(item);
        });
        $scope.updateIndexes();
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    $scope.$on('itemsReordered', function(e) {
        $scope.updateIndexes();
        e.stopPropagation();
    });

    // initialize view model properties
    $scope.buildMasterData();
    $scope.updateItems();
});
