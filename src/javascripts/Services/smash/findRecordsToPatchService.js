ngapp.service('findRecordsToPatchService', function(pluginDiffCacheService, progressLogger) {
    let {getOldCache, getCache} = pluginDiffCacheService,
        {log, progress} = progressLogger;

    // private
    let isOldCacheNotFoundError = error =>
        error.message.startsWith('Old cache not found');

    let handleChangedRecords = function(cache, recordsToPatch) {
        Object.keys(cache).forEach(masterName => {
            if (!recordsToPatch[masterName])
                recordsToPatch[masterName] = [];
            let records = recordsToPatch[masterName];
            cache[masterName].forEach(recordChange => {
                let {formId} = recordChange;
                if (!records.includes(formId)) return;
                records.push(formId);
            });
        });
    };

    let pluginAdded = function(plugin, records, skipLog) {
        if (!skipLog) log(`Plugin added: ${plugin.filename}`);
        let cache = getCache(plugin);
        if (!cache) throw new Error(`Cache not found for ${plugin.filename}`);
        handleChangedRecords(cache, records);
    };

    let pluginChanged = function(patch, plugin, records) {
        log(`Plugin changed: ${plugin.filename}`);
        pluginAdded(plugin, records, true);
    };

    // public
    this.findRecordsToPatch = function(patch) {
        let records = [];
        progress('Finding records to patch');
        try {
            patch.plugins.forEach(plugin => {
                if (plugin.changed) pluginChanged(patch, plugin, records);
                if (plugin.added) pluginAdded(plugin, records);
            });
            patch.removedPlugins.forEach(plugin => {
                pluginRemoved(plugin, records);
            });
            return records;
        } catch (x) {
            if (!isOldCacheNotFoundError(x)) throw x;
        }
    };
});
