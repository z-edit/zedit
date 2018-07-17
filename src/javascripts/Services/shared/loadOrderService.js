ngapp.service('loadOrderService', function() {
    let service = this,
        disabledTitle = 'This plugin cannot be loaded because it requires plugins \r\n' +
        'which are unavailable or cannot be loaded:',
        requiredTitle = 'This plugin is required by:',
        warnTitle = 'This plugin requires active plugins:';

    // helper functions
    let defaultActiveFilter = (item) => { return item.active };

    let findIgnoreCase = function(ary, searchStr) {
        searchStr = searchStr.toLowerCase();
        return ary.find((str) => { return str.toLowerCase() === searchStr });
    };

    let buildTitle = function(title, filenames) {
        if (filenames.length === 0) return '';
        filenames.slice(0, 10).forEach(function(filename) {
            title += `\r\n  - ${filename}`;
        });
        if (filenames.length > 10) title += '\r\n  - etc.';
        return title;
    };

    let findItem = function(loadOrder, filename) {
        filename = filename.toLowerCase();
        return loadOrder.find(function(item) {
            return !item.disabled && item.filename.toLowerCase() === filename;
        });
    };

    let getRequiredBy = function(loadOrder, filename) {
        return loadOrder.filter(function(item) {
            return !!findIgnoreCase(item.masterNames, filename);
        });
    };

    let getMasters = function(loadOrder, item) {
        return item.masterNames.map(function(masterName) {
            return findItem(loadOrder, masterName);
        });
    };

    let disablePlugin = function(item) {
        let missingMasters = item.masterNames.filter(function(n, i) {
            return !item.masters[i]
        });
        logger.warn(`Disabling ${item.filename}, missing masters: ${missingMasters}`);
        item.active = false;
        item.disabled = true;
        item.title = buildTitle(disabledTitle, missingMasters);
        item.requiredBy.forEach(disablePlugin);
    };

    let activatePlugin = function(item) {
        item.active = true;
        service.activateMasters(item);
        item.masters.forEach(service.updateRequired);
    };

    let deactivatePlugin = function(item) {
        item.active = false;
        item.required = false;
        item.title = '';
        service.deactivateRequiredBy(item);
        item.masters.forEach(service.updateRequired);
    };

    let buildMasterData = function(loadOrder) {
        loadOrder.forEach(function(item) {
            item.masters = getMasters(loadOrder, item);
            item.requiredBy = getRequiredBy(loadOrder, item.filename);
        });
    };

    let updateMasters = function(loadOrder) {
        loadOrder.forEach(function(item) {
            if (item.masters.includes(undefined)) {
                disablePlugin(item);
            } else if (item.active && service.activateMode) {
                service.activateMasters(item);
            }
        });
    };

    // public api
    this.activateMode = true;

    this.activateMasters = function(item) {
        item.masters.forEach(function(masterItem) {
            if (!masterItem.active) activatePlugin(masterItem);
        });
    };

    this.deactivateRequiredBy = function(item) {
        item.requiredBy.forEach(function(requiredItem) {
            if (requiredItem.active) deactivatePlugin(requiredItem);
        });
    };

    this.updateIndexes = function(loadOrder) {
        let n = 0;
        loadOrder.filter(service.activeFilter)
            .forEach((item) => item.index = n++);
    };

    this.updateRequired = function(item) {
        if (item.disabled) return;
        let activeRequiredBy = item.requiredBy
            .filter(service.activeFilter).mapOnKey('filename');
        item.required = activeRequiredBy.length > 0;
        item.title = buildTitle(requiredTitle, activeRequiredBy);
    };

    this.updateWarnings = function(item) {
        if (item.disabled) return;
        let activeMasters = item.masters
            .filterOnKey('active').mapOnKey('filename');
        item.warn = activeMasters.length > 0;
        item.title = buildTitle(warnTitle, activeMasters);
    };

    this.init = function(loadOrder, activeFilter = defaultActiveFilter) {
        service.activeFilter = activeFilter;
        buildMasterData(loadOrder);
        updateMasters(loadOrder);
        loadOrder.forEach(service.updateRequired);
        service.updateIndexes(loadOrder);
    }
});