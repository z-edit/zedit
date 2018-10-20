ngapp.service('loadOrderService', function($rootScope) {
    let service = this,
        disabledTitle = 'This plugin cannot be loaded because it requires plugins \r\n' +
        'which are unavailable or cannot be loaded:',
        requiredTitle = 'This plugin is required by:',
        warnTitle = 'This plugin requires active plugins:';

    // helper functions
    let warn = msg => (logger.closed() ? console : logger).warn(msg);
    let error = msg => (logger.closed() ? console : logger).error(msg);

    let defaultActiveFilter = (item) => { return item && item.active };

    let findIgnoreCase = function(ary, searchStr) {
        searchStr = searchStr.toLowerCase();
        return ary.find(str => str.toLowerCase() === searchStr);
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
        return loadOrder.find(item => {
            return !item.disabled && item.filename.toLowerCase() === filename;
        });
    };

    let getRequiredBy = function(loadOrder, filename) {
        return loadOrder.filter(item => {
            return !!findIgnoreCase(item.masterNames, filename);
        });
    };

    let getMasters = function(loadOrder, item) {
        return item.masterNames.map(masterName => {
            return findItem(loadOrder, masterName);
        });
    };

    let disablePlugin = function(item) {
        let missingMasters = item.masterNames.filter((n, i) => {
            return !item.masters[i]
        });
        warn(`Disabling ${item.filename}, missing masters: ${missingMasters}`);
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
        loadOrder.forEach(item => {
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

    let getMasterNames = function(filename) {
        let handle;
        try {
            handle = xelib.LoadPluginHeader(filename);
            return xelib.GetMasterNames(handle);
        } catch(x) {
            error(x.stack);
        } finally {
            if (handle) xelib.UnloadPlugin(handle);
        }
    };

    let getLoadOrder = function () {
        let loadOrder = xelib.GetLoadOrder().split('\r\n'),
            activePlugins = xelib.GetActivePlugins().split('\r\n');
        console.log({loadOrder, activePlugins});
        return loadOrder.map(function(filename) {
            return {
                filename: filename,
                masterNames: getMasterNames(filename) || [],
                active: activePlugins.includes(filename)
            }
        })
    };

    // public api
    this.activateMode = true;

    this.activateMasters = function(item) {
        item.masters.forEach(masterItem => {
            if (masterItem && !masterItem.active) activatePlugin(masterItem);
        });
    };

    this.deactivateRequiredBy = function(item) {
        item.requiredBy.forEach(requiredItem => {
            if (requiredItem.active) deactivatePlugin(requiredItem);
        });
    };

    this.updateIndexes = function(loadOrder) {
        let n = 0;
        loadOrder.filter(service.activeFilter)
            .forEach((item) => item.index = n++);
    };

    this.updateRequired = function(item) {
        if (!item || item.disabled) return;
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

    this.init = function(plugins, activeFilter = defaultActiveFilter) {
        if (!plugins) plugins = $rootScope.loadOrder = getLoadOrder();
        service.activeFilter = activeFilter;
        buildMasterData(plugins);
        updateMasters(plugins);
        plugins.forEach(service.updateRequired);
        service.updateIndexes(plugins);
    };
});
