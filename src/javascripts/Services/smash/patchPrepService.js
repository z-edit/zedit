ngapp.service('patchPrepService', function($q, $rootScope, progressService, pluginDiffCacheService) {
    let {WithHandle, FileByName, HasElement, LoadPlugin, LoadPlugins,
            GetLoaderStatus, LoadPluginHeader, GetMasterNames,
            BackupPlugin, GetElement, RemoveElement} = xelib,
        {progressMessage, showProgress} = progressService;

    // private
    let backupPlugin = function(patch) {
        let action = $q.defer();
        logger.log(`Backing up: ${patch.filename}`);
        BackupPlugin(patch.filename);
        action.resolve('Plugin backup created');
        return action.promise;
    };

    let getRecordsToRemove = function(cache, masterMap, formIds) {
        return Object.keys(cache).forEach(masterName => {
            let index = masterMap.indexOf(masterName);
            if (index === -1) return;
            let baseOrdinal = index * 0x1000000;
            cache[masterName].forEach(recordChange => {
                let formId = baseOrdinal + parseInt(recordChange.formId, 16),
                    hexFormId = formId.toString(16);
                if (!formIds.includes(hexFormId))
                    formIds.push(hexFormId);
            });
        });
    };

    let pluginRemoved = function(plugin, patchPlugin, records) {
        log(`Getting records to remove for: ${plugin.filename}`);
        let cache = pluginDiffCacheService.getOldCache(plugin);
        if (!cache) throw new Error(`Old cache not found for ${plugin.filename}`);
        let masterMap = xelib.GetMasterNames(patchPlugin);
        getRecordsToRemove(cache, masterMap, records)
    };

    let getRemovedPlugins = function(patch) {
        return Array.prototype.concat(
            patch.oldPlugins,
            patch.plugins.filterOnKey('changed')
        );
    };

    let getPatchRecordsToRemove = function(patch, patchPlugin) {
        return getRemovedPlugins(patch).reduce((records, plugin) => {
            pluginRemoved(plugin, patchPlugin, records);
            return records;
        }, []);
    };

    let removePatchRecord = function(patchPlugin, formId) {
        WithHandle(GetElement(patchPlugin, '&' + formId), rec => {
            if (rec) RemoveElement(rec);
        });
    };

    let unloadAllPlugins = function() {
        let fileCount = xelib.ElementCount(0);
        for (let i = fileCount - 1; i >= 0; i--) {
            let plugin = xelib.FileByIndex(i);
            logger.log(`Unloading ${xelib.Name(plugin)}`);
            xelib.UnloadPlugin(plugin);
            xelib.Release(plugin);
        }
    };

    let deleteOldPatchRecords = function(patch, action) {
        try {
            progressMessage('Deleting old patch records...');
            WithHandle(FileByName(patch.filename), patchPlugin => {
                getPatchRecordsToRemove(patch, patchPlugin)
                    .forEach(fid => removePatchRecord(patchPlugin, fid));
            });
            unloadAllPlugins();
            action.resolve('Patch cleaned successfully.');
        } catch (x) {
            action.reject(x);
        }
    };

    let checkIfLoaded = function(action, patch) {
        let loaderStatus = GetLoaderStatus();
        if (loaderStatus === xelib.lsDone) {
            if (HasElement(patch.filename)) {
                LoadPlugin(patch.filename);
                checkIfLoaded(action, patch);
            } else {
                deleteOldPatchRecords(patch, action);
            }
        } else if (loaderStatus === xelib.lsError) {
            action.reject('CRITICAL ERROR: Cleaning patch failed!')
        } else {
            setTimeout(() => checkIfLoaded(action, patch), 250);
        }
    };

    let cleanPatch = function(patch) {
        let action = $q.defer(),
            plugin = LoadPluginHeader(patch.filename),
            loadOrder = GetMasterNames(plugin);
        progressMessage('Loading patch plugin for cleaning...');
        LoadPlugins(loadOrder.join('\r\n'), false, true);
        checkIfLoaded(action, patch);
        return action.promise;
    };

    // PUBLIC API
    this.preparePatch = function(patch) {
        showProgress({ message: 'Preparing patch...' });
        let patchPlugin = $rootScope.loadOrder
            .findByKey('filename', patch.filename);
        if (!patchPlugin) return;
        return patch.updated ? cleanPatch(patch) : backupPlugin(patch);
    };
});
