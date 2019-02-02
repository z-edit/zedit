ngapp.service('recordMergingService', function(progressLogger, progressService) {
    let getFid = rec => xelib.GetHexFormID(rec, false, true);
    let getMergePlugins = merge => merge.plugins.mapOnKey('handle');
    let getAllRecords = plugin => xelib.GetRecords(plugin, '', true);
    let isNewRecord = rec => !xelib.IsOverride(rec) && !xelib.IsInjected(rec);

    let tryCopy = function(rec, merge) {
        let name = xelib.LongName(rec);
        try {
            progressLogger.log(`Copying ${name}`, true);
            return xelib.CopyElement(rec, merge.plugin, false);
        } catch (x) {
            progressLogger.warn(`Failed to copy record ${name}, ${x.stack}`);
            merge.failedToCopy.push({
                rec: name,
                stack: x.stack
            });
        }
    };

    let getNextFormId = function(merge) {
        while (merge.usedFids.hasOwnProperty(xelib.Hex(merge.nextFormId, 6)))
            merge.nextFormId++;
        return merge.nextFormId;
    };

    let renumberRecord = function(rec, oldFid, newFormId, merge, fidMap, index) {
        let newFid = xelib.Hex(newFormId % 0x1000000, 6),
            msg = `Renumbering ${oldFid} to ${newFid}`;
        progressLogger.log(msg, true);
        fidMap[oldFid] = newFid;
        xelib.SetFormID(rec, newFormId);
        merge.usedFids[newFid] = index;
    };

    // TODO: don't copy losing overrides
    let copyPluginRecords = function(plugin, merge, allowNew) {
        let newRecords = [];
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            let isNew = allowNew && isNewRecord(rec),
                newRec = tryCopy(rec, merge);
            if (!newRec) return;
            isNew ? newRecords.push(newRec) : xelib.Release(newRec);
        });
        return newRecords;
    };

    let renumberPluginRecords = function(plugin, merge, index) {
        let pluginName = xelib.Name(plugin),
            fidMap = merge.fidMap[pluginName] = {},
            base = xelib.GetFileLoadOrder(plugin) << 24;
        progressLogger.log(`Renumbering FormIDs in ${pluginName}`);
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            if (!isNewRecord(rec)) return;
            let oldFid = getFid(rec);
            if (merge.usedFids[oldFid] > -1) {
                let newFormId = base + getNextFormId(merge);
                renumberRecord(rec, oldFid, newFormId, merge, fidMap, index);
            } else {
                merge.usedFids[oldFid] = index;
            }
        });
    };

    let getUsedFormIds = function(merge) {
        merge.usedFids = {};
        progressLogger.progress('Getting used FormIDs...');
        getMergePlugins(merge).forEach(plugin => {
            let pluginName = xelib.Name(plugin);
            progressLogger.log(`Getting used FormIDs in ${pluginName}`);
            xelib.WithEachHandle(getAllRecords(plugin), rec => {
                if (!isNewRecord(rec)) return;
                merge.usedFids[getFid(rec)] = -1;
            });
        });
    };

    let renumberFormIds = function(merge) {
        merge.nextFormId = 0x000801;
        progressLogger.progress('Renumbering FormIDs...');
        getMergePlugins(merge).forEach((plugin, index) => {
            renumberPluginRecords(plugin, merge, index);
        });
    };

    let copyRecords = function(merge, allowNew) {
        progressLogger.progress('Copying records...');
        if (allowNew) merge.newRecords = {};
        getMergePlugins(merge).forEachReverse((plugin, index) => {
            let pluginName = xelib.Name(plugin);
            progressLogger.log(`Copying records from ${pluginName}`);
            let newRecords = copyPluginRecords(plugin, merge, allowNew, index);
            if (allowNew) merge.newRecords[pluginName] = newRecords;
            progressService.addProgress(1);
        });
    };

    let refactorPluginReferences = function(plugin, merge, index) {
        let pluginName = xelib.Name(plugin),
            fidMap = merge.fidMap[pluginName] = {},
            base = xelib.GetFileLoadOrder(merge.plugin) << 24;
        progressLogger.log(`Refactoring references to ${pluginName}`);
        merge.newRecords[pluginName].forEach(rec => {
            let oldFid = getFid(rec);
            if (merge.usedFids[oldFid] > -1) {
                let newFormId = base + getNextFormId(merge);
                renumberRecord(rec, oldFid, newFormId, merge, fidMap, index);
            } else {
                xelib.SetFormID(rec, base + parseInt(oldFid, 16));
                merge.usedFids[oldFid] = index;
            }
        });
    };

    let refactorReferences = function(merge) {
        progressLogger.progress(`Refactoring references...`);
        merge.nextFormId = 0x000801;
        progressLogger.log(`Building references for ${merge.filename}`);
        xelib.BuildReferences(merge.plugin);
        getMergePlugins(merge).forEach((plugin, index) => {
            refactorPluginReferences(plugin, merge, index);
        });
    };

    let renumberAndCopy = function(merge) {
        getUsedFormIds(merge);
        renumberFormIds(merge);
        copyRecords(merge, false);
    };

    let copyAndRefactor = function(merge) {
        getUsedFormIds(merge);
        copyRecords(merge, true);
        refactorReferences(merge);
    };

    let mergeMethods = {
        'Master': renumberAndCopy,
        'Clobber': renumberAndCopy,
        'Clean': copyAndRefactor
    };

    // PUBLIC API
    this.mergeRecords = function(merge) {
        merge.fidMap = {};
        mergeMethods[merge.method](merge);
    };
});
