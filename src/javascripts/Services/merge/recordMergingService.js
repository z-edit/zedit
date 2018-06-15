ngapp.service('recordMergingService', function(mergeLogger, progressService) {
    let getFid = (rec) => { return xelib.GetHexFormID(rec, false, true) };
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
        while (merge.usedFids.hasOwnProperty(merge.nextFormId))
            merge.nextFormId = xelib.Hex(parseInt(merge.nextFormId, 16) + 1, 6);
        merge.usedFids[merge.nextFormId] = true;
        return parseInt(merge.nextFormId++, 16);
    };

    let renumberPluginRecords = function(plugin, merge) {
        let fidMap = {},
            loadOrdinal = xelib.GetFileLoadOrder(plugin) << 24;
        xelib.WithEachHandle(getAllRecords(plugin), rec => {
            if (xelib.IsOverride(rec) || xelib.IsInjected(rec)) return;
            let oldFormId = getFid(rec);
            if (merge.usedFids[oldFormId]) {
                let newFormId = getNextFormId(merge),
                    newHexFormId = xelib.Hex(newFormId, 6),
                    msg = `Renumbering ${oldFormId} to ${newHexFormId}`;
                mergeLogger.log(msg, true);
                fidMap[oldFormId] = newFormId;
                xelib.SetFormID(rec, loadOrdinal + newFormId);
            } else {
                merge.usedFids[oldFormId] = true;
            }
        });
        return fidMap;
    };

    let getUsedFormIds = function(merge) {
        merge.usedFids = {};
        mergeLogger.progress('Getting used FormIDs...');
        getMergePlugins(merge).forEach(plugin => {
            let pluginName = xelib.Name(plugin);
            mergeLogger.log(`Getting used FormIDs in ${pluginName}`);
            xelib.WithEachHandle(getAllRecords(plugin), rec => {
                if (xelib.IsOverride(rec) || xelib.IsInjected(rec)) return;
                merge.usedFids[getFid(rec)] = false;
            });
        });
    };

    let renumberFormIds = function(merge) {
        merge.nextFormId = '000801';
        mergeLogger.progress('Renumbering FormIDs...');
        getMergePlugins(merge).forEach(plugin => {
            let pluginName = xelib.Name(plugin);
            mergeLogger.log(`Renumbering FormIDs in ${pluginName}`);
            merge.fidMap[pluginName] = renumberPluginRecords(plugin, merge);
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

    let mergeMethods = {
        'Clamp': function(merge) {
            getUsedFormIds(merge);
            renumberFormIds(merge);
            copyRecords(merge, false);
        },
        'Refactor': function(merge) {
            mergeLogger.error('Refactor merge method not implemented');
            copyRecords(merge, true);
            xelib.RefactorReferences(merge.plugin, merge.fidMap);
        }
    };

    // PUBLIC API
    this.mergeRecords = function(merge) {
        merge.fidMap = {};
        mergeMethods[merge.method || 'Clamp'](merge);
    };
});