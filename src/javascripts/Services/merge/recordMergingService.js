ngapp.service('recordMergingService', function(mergeLogger, progressService) {
    let getFid = rec => xelib.GetHexFormID(rec, false, true);
    let getMergePlugins = merge => merge.plugins.mapOnKey('handle');
    let getAllRecords = plugin => xelib.GetRecords(plugin, '', true);

    let tryCopy = function(rec, merge, asNew) {
        let name = xelib.LongName(rec);
        try {
            mergeLogger.log(`Copying ${name}`, true);
            return xelib.CopyElement(rec, merge.plugin, asNew);
        } catch (x) {
            mergeLogger.warn(`Failed to copy record ${name}, ${x.stack}`);
            merge.failedToCopy.push({
                rec: name,
                stack: x.stack
            });
        }
    };

    let copyPluginRecords = function(plugin, merge, allowNew) {
        let fidMap = {};
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            // TODO: don't copy lower overrides
            let asNew = allowNew && xelib.IsMaster(rec),
                newRec = tryCopy(rec, merge, asNew);
            if (!asNew) return;
            fidMap[getFid(rec)] = newRec ? getFid(newRec) : -1;
        });
        return fidMap;
    };

    let getNextFormId = function(merge) {
        while (merge.usedFids.hasOwnProperty(xelib.Hex(merge.nextFormId, 6)))
            merge.nextFormId++;
        return merge.nextFormId;
    };

    let getElementFileName = function(element) {
        return xelib.WithHandle(xelib.GetElementFile(element), xelib.Name);
    };

    let renumberReferences = function(rec, oldFormId, newFormId) {
        xelib.GetReferencedBy(rec).forEach(ref => {
            let name = xelib.LongName(ref);
            mergeLogger.log(`- Fixing references in ${name}`, true);
            xelib.ExchangeReferences(ref, oldFormId, newFormId);
        });
        // log failures
        xelib.GetReferencedBy(rec).map(xelib.LongName).forEach(name => {
            mergeLogger.warn(`- Failed to fix all references in ${name}`);
        });
    };

    let renumberOverrides = function(rec, newFormId) {
        xelib.GetOverrides(rec).forEach(override => {
            let fileName = getElementFileName(override);
            mergeLogger.log(`- Renumbering override in file: ${fileName}`);
            xelib.SetFormID(override, newFormId, false, false);
        });
    };

    let renumberRecord = function(rec, newFormId) {
        let oldFormId = xelib.GetFormID(rec);
        renumberReferences(rec, oldFormId, newFormId);
        renumberOverrides(rec, newFormId);
        xelib.SetFormID(rec, newFormId, false, false);
    };

    let renumberPluginRecords = function(plugin, merge, index) {
        let pluginName = xelib.Name(plugin),
            fidMap = merge.fidMap[pluginName] = {},
            loadOrdinal = xelib.GetFileLoadOrder(plugin) << 24;
        mergeLogger.log(`Renumbering FormIDs in ${pluginName}`);
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            if (xelib.IsOverride(rec) || xelib.IsInjected(rec)) return;
            let oldFormId = getFid(rec);
            if (merge.usedFids[oldFormId] > -1) {
                let newFormId = getNextFormId(merge),
                    newHexFormId = xelib.Hex(newFormId, 6),
                    msg = `Renumbering ${oldFormId} to ${newHexFormId}`;
                mergeLogger.log(msg, true);
                fidMap[oldFormId] = newHexFormId;
                newFormId += loadOrdinal;
                renumberRecord(rec, newFormId);
                merge.usedFids[newHexFormId] = index;
            } else {
                merge.usedFids[oldFormId] = index;
            }
        });
    };

    let getUsedFormIds = function(merge) {
        merge.usedFids = {};
        mergeLogger.progress('Getting used FormIDs...');
        getMergePlugins(merge).forEach(plugin => {
            let pluginName = xelib.Name(plugin);
            mergeLogger.log(`Getting used FormIDs in ${pluginName}`);
            xelib.WithEachHandle(getAllRecords(plugin), rec => {
                if (xelib.IsOverride(rec) || xelib.IsInjected(rec)) return;
                merge.usedFids[getFid(rec)] = -1;
            });
        });
    };

    let renumberFormIds = function(merge) {
        merge.nextFormId = 0x000801;
        mergeLogger.progress('Renumbering FormIDs...');
        getMergePlugins(merge).forEach((plugin, index) => {
            renumberPluginRecords(plugin, merge, index);
        });
    };

    let copyRecords = function(merge, allowNew) {
        mergeLogger.progress('Copying records...');
        getMergePlugins(merge).forEachReverse(plugin => {
            let pluginName = xelib.Name(plugin);
            mergeLogger.log(`Copying records from ${pluginName}`);
            let fidMap = copyPluginRecords(plugin, merge, allowNew);
            if (allowNew) merge.fidMap[pluginName] = fidMap;
            progressService.addProgress(1);
        });
    };

    let renumberAndCopy = function(merge) {
        getUsedFormIds(merge);
        renumberFormIds(merge);
        copyRecords(merge, false);
    };

    let copyAndRefactor = function(merge) {
        mergeLogger.error('Refactor merge method not implemented');
        copyRecords(merge, true);
        // TODO: xelib.RefactorReferences(merge.plugin, merge.fidMap);
    };

    let mergeMethods = {
        'Master': renumberAndCopy,
        'Clamp': renumberAndCopy,
        'Refactor': copyAndRefactor
    };

    // PUBLIC API
    this.mergeRecords = function(merge) {
        merge.fidMap = {};
        mergeMethods[merge.method || 'Clamp'](merge);
    };
});
