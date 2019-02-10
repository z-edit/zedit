ngapp.service('recordMergingService', function(progressLogger, progressService) {
    let getFid = rec => xelib.GetHexFormID(rec, false, true);
    let getMergePlugins = merge => merge.plugins.mapOnKey('handle');
    let getAllRecords = plugin => xelib.GetRecords(plugin, '', true);
    let isNewRecord = rec => !xelib.IsOverride(rec) && !xelib.IsInjected(rec);

    let pluginInMerge = (merge, plugin) => {
        return !!merge.plugins.findByKey('filename', plugin);
    };

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

    let isInjectedInMerge = function(merge, rec) {
        return xelib.WithHandle(xelib.GetInjectionTarget(rec), file => {
            if (!file) return false;
            return pluginInMerge(merge, xelib.Name(file));
        });
    };

    let shouldTrack = function(merge, rec) {
        let isOverride = xelib.IsOverride(rec),
            isInjected = xelib.IsInjected(rec);
        return (!isOverride && !isInjected) ||
            (isInjected && isInjectedInMerge(merge, rec));
    };

    // TODO: don't copy losing overrides
    let copyPluginRecords = function(plugin, merge, trackNew) {
        let newRecords = [];
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            let fid = xelib.GetFormID(rec);
            if (merge.copiedFids.includes(fid)) return;
            let track = trackNew && shouldTrack(merge, rec),
                newRec = tryCopy(rec, merge);
            if (!newRec) return;
            merge.copiedFids.push(fid);
            track ? newRecords.push(newRec) : xelib.Release(newRec);
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

    let copyRecords = function(merge, trackNew) {
        progressLogger.progress('Copying records...');
        merge.copiedFids = [];
        if (trackNew) merge.newRecords = {};
        getMergePlugins(merge).forEachReverse((plugin, index) => {
            let pluginName = xelib.Name(plugin);
            progressLogger.log(`Copying records from ${pluginName}`);
            let newRecords = copyPluginRecords(plugin, merge, trackNew, index);
            if (trackNew) merge.newRecords[pluginName] = newRecords;
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
