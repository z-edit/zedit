ngapp.controller('loadOrderModalController', function ($scope, appModeService) {
    // helper variables
    let disabledTitle = 'This plugin cannot be loaded because it requires plugins \r\n' +
        'which are unavailable or cannot be loaded:',
        requiredTitle = 'This plugin is required by the following active plugins:',
        opts = $scope.modalOptions;

    // helper functions
    let findIgnoreCase = function(ary, searchStr) {
        searchStr = searchStr.toLowerCase();
        return ary.find((str) => { return str.toLowerCase() === searchStr });
    };

    let findItem = function(filename) {
        filename = filename.toLowerCase();
        return opts.loadOrder.find(function(item) {
            return !item.disabled && item.filename.toLowerCase() === filename;
        });
    };

    let getRequiredBy = function(filename) {
        return opts.loadOrder.filter(function(item) {
            return !!findIgnoreCase(item.masterNames, filename);
        });
    };

    let getMasters = function(item) {
        return item.masterNames.map(function(masterName) {
            return findItem(masterName);
        });
    };

    let buildTitle = function(title, filenames) {
        if (filenames.length === 0) return '';
        filenames.slice(0, 10).forEach(function(filename) {
            title += `\r\n  - ${filename}`;
        });
        if (filenames.length > 10) title += '\r\n  - etc.';
        return title;
    };

    let disablePlugin = function(item) {
        let missingMasters = item.masterNames.filter(function(n, i) {
            return !item.masters[i]
        });
        console.log(`Disabling ${item.filename}, missing masters: ${missingMasters}`);
        item.active = false;
        item.disabled = true;
        item.title = buildTitle(disabledTitle, missingMasters);
        disableRequiredBy(item);
    };

    let updateRequired = function(item) {
        if (!item.active) return;
        let activeRequiredBy = item.requiredBy
            .filter((item) => { return item.active; })
            .map((item) => { return item.filename; });
        item.required = activeRequiredBy.length > 0;
        item.title = buildTitle(requiredTitle, activeRequiredBy);
    };

    let activatePlugin = function(item) {
        item.active = true;
        enableMasters(item);
        item.masters.forEach(updateRequired);
    };

    let deactivatePlugin = function(item) {
        item.active = false;
        item.required = false;
        item.title = '';
        disableRequiredBy(item);
        item.masters.forEach(updateRequired);
    };

    let enableMasters = function(item) {
        item.masters.forEach(function(masterItem) {
            if (!masterItem.active) activatePlugin(masterItem);
        });
    };

    let disableRequiredBy = function(item) {
        item.requiredBy.forEach(function(requiredItem) {
            if (requiredItem.active) deactivatePlugin(requiredItem);
        });
    };

    let updateIndexes = function() {
        let n = 0;
        opts.loadOrder.forEach(function(item) {
            if (item.active) item.index = n++;
        });
    };

    let buildMasterData = function() {
        opts.loadOrder.forEach(function(item) {
            item.masters = getMasters(item);
            item.requiredBy = getRequiredBy(item.filename);
        });
    };

    let fixMasters = function() {
        opts.loadOrder.forEach(function(item) {
            if (item.masters.includes(undefined)) {
                disablePlugin(item);
            } else if (item.active) {
                enableMasters(item);
            }
        });
    };

    let updateItems = function() {
        opts.loadOrder.forEach(function(item) {
            if (item.active) updateRequired(item);
        });
        updateIndexes();
    };

    // scope functions
    $scope.loadPlugins = function() {
        let loadOrder = opts.loadOrder.
            filter((item) => { return item.active; }).
            map((item) => { return item.filename;  });
        console.log("Loading: \n" + loadOrder);
        xelib.ClearMessages();
        xelib.LoadPlugins(loadOrder.join('\n'));
        appModeService.setAppMode();
        $scope.$emit('closeModal');
    };

    $scope.itemToggled = function(item) {
        item.active ? enableMasters(item) : disableRequiredBy(item);
        if (!item.active) {
            item.required = false;
            item.title = '';
        }
        item.masters.forEach(updateRequired);
        updateIndexes();
    };

    // event handlers
    $scope.$on('itemToggled', function(e, item) {
        $scope.itemToggled(item);
        e.stopPropagation();
    });

    $scope.$on('itemsReordered', function(e) {
        updateIndexes();
        e.stopPropagation();
    });

    // initialize view model properties
    buildMasterData();
    fixMasters();
    updateItems();
});
