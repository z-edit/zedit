ngapp.service('patchBuilder', function(progressLogger, progressService, pluginDiffCacheService, recordsToPatchService) {
    let {findRecordsToPatch} = recordsToPatchService,
        {log, progress} = progressLogger;

    // PRIVATE
    let mergeRecordChanges = function(changes, newChanges) {
        // TODO: resolve rule for the newChange
        // TODO: merge based on the rule and stored changes
    };

    let mergeChanges = function(patch, excludeRecord) {
        return patch.plugins.reduce((changes, plugin) => {
            let cache = getCache(plugin);
            if (!cache) throw new Error(`Cache not found for ${plugin.filename}`);
            Object.keys(cache).forEach(masterName => {
                if (!changes[masterName]) changes[masterName] = {};
                let masterChanges = changes[masterName];
                masterChanges.forEach(change => {
                    let {formId} = change;
                    if (excludeRecord && excludeRecord(formId)) return;
                    if (!masterChanges[formId])
                        masterChanges[formId] = [];
                    mergeRecordChanges(masterChanges[formId], change);
                });
            });
        }, {});
    };

    let loadPatch = function(patch) {
        patch.plugin = xelib.GetElement(0, patch.filename);
        if (patch.plugin) return true;
        patch.plugin = xelib.AddFile(patch.filename, true);
    };

    let applyChanges = function(patch, changes) {
        // TODO: iterate through changes
        // TODO: copy records to patch
        // TODO: apply the changes to the patch records
    };

    // PUBLIC API
    this.buildPatch = function(patch) {
        pluginDiffCacheService.updateCache();
        let records = loadPatch(patch) && findRecordsToPatch(patch),
            excludeFn = records && (fid => records.includes(fid)),
            changes = mergeChanges(patch, excludeFn);
        applyChanges(patch, changes);
    };

    this.showProgress = () => progressService.showProgress({
        determinate: true,
        title: 'Building Smashed Patch',
        message: 'Initializing...',
        logName: 'smash',
        current: 0,
        max: 1
    });
});
