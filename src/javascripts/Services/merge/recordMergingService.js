ngapp.service('recordMergingService', function(progressLogger, progressService) {
    let getFid = rec => xelib.GetHexFormID(rec, false, true);
    let getMergePlugins = merge => merge.plugins.mapOnKey('handle');
    let getAllRecords = plugin => xelib.GetRecords(plugin, '', true);
    let isNewRecord = rec => !xelib.IsOverride(rec) && !xelib.IsInjected(rec);

    let tryCopy = function(rec, merge, asNew) {
        let name = xelib.LongName(rec);
        try {
            progressLogger.log(`Copying ${name}`, true);
            return xelib.CopyElement(rec, merge.plugin, asNew);
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

    let renumberRecord = function(oldRec, target, merge, fidMap, base, index) {
        let oldFormId = getFid(oldRec);
        if (merge.usedFids[oldFormId] > -1) {
            let newFormId = getNextFormId(merge),
                newHexFormId = xelib.Hex(newFormId, 6),
                msg = `Renumbering ${oldFormId} to ${newHexFormId}`;
            progressLogger.log(msg, true);
            fidMap[oldFormId] = newHexFormId;
            xelib.SetFormID(target, base + newFormId, false, fixRef);
            merge.usedFids[newHexFormId] = index;
        } else {
            merge.usedFids[oldFormId] = index;
        }
    };

    // TODO: don't copy losing overrides
    let copyPluginRecords = function(plugin, merge, allowNew, index) {
        let fidMap = {},
            loadOrdinal = xelib.GetFileLoadOrder(merge.plugin) << 24;
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            let asNew = allowNew && isNewRecord(rec),
                newRec = tryCopy(rec, merge, asNew);
            if (!asNew) return;
            renumberRecord(rec, newRec, merge, fidMap, loadOrdinal, index);
        });
        return fidMap;
    };

    let renumberPluginRecords = function(plugin, merge, index) {
        let pluginName = xelib.Name(plugin),
            fidMap = merge.fidMap[pluginName] = {},
            loadOrdinal = xelib.GetFileLoadOrder(plugin) << 24;
        progressLogger.log(`Renumbering FormIDs in ${pluginName}`);
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            if (!isNewRecord(rec)) return;
            renumberRecord(rec, rec, merge, fidMap, loadOrdinal, index);
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
        getMergePlugins(merge).forEachReverse((plugin, index) => {
            let pluginName = xelib.Name(plugin);
            progressLogger.log(`Copying records from ${pluginName}`);
            let fidMap = copyPluginRecords(plugin, merge, allowNew, index);
            if (allowNew) merge.fidMap[pluginName] = fidMap;
            progressService.addProgress(1);
        });
    };

    let refactorPluginReferences = function(plugin, merge) {
        let pluginName = xelib.Name(plugin),
            fidMap = merge.fidMap[pluginName],
            oldOrdinal = xelib.GetFileLoadOrder(plugin) << 24,
            newOrdinal = xelib.GetFileLoadOrder(merge.plugin) << 24;
        progressLogger.log(`Refactoring references in ${pluginName}`);
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            if (!isNewRecord(rec)) return;
            let oldFid = getFid(rec),
                newFid = fidMap[oldFid],
                oldFormId = oldOrdinal + parseInt(oldFid, 16),
                newFormId = newOrdinal + parseInt(newFid, 16);
            xelib.GetReferencedBy(rec).forEach(ref => {
                xelib.ExchangeReferences(ref, oldFormId, newFormId);
            });
        });
    };

    let refactorReferences = function(merge) {
        progressLogger.progress(`Building references for ${merge.filename}`);
        xelib.BuildReferences(merge.plugin);
        progressLogger.progress(`Refactoring references...`);
        getMergePlugins(merge).forEach(plugin => {
            refactorPluginReferences(plugin, merge);
        });
    };

    let renumberAndCopy = function(merge) {
        getUsedFormIds(merge);
        renumberFormIds(merge);
        copyRecords(merge, false);
    };

    let copyAndRefactor = function(merge) {
        copyRecords(merge, true);
        refactorReferences(merge);
    };

    let mergeMethods = {
        'Master': renumberAndCopy,
        'Clamp': renumberAndCopy,
        'Refactor': copyAndRefactor
    };

    // PUBLIC API
    this.mergeRecords = function(merge) {
        merge.fidMap = {};
        mergeMethods[merge.method](merge);
    };
});
