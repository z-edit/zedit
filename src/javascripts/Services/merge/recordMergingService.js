ngapp.service('recordMergingService', function() {
    let getFid = (rec) => { return xelib.GetHexFormID(rec, false, true) };
    let getMergePlugins = merge => merge.plugins.mapOnKey('handle');
    let getAllRecords = plugin => xelib.GetRecords(plugin, '', true);

    let tryCopy = function(rec, merge, asNew) {
        try {
            return xelib.CopyElement(rec, merge.plugin, asNew);
        } catch (x) {
            merge.failedToCopy.add({
                rec: xelib.LongName(rec),
                stack: x.stackTrace
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
                let newFormId = getNextFormId(merge);
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
        getMergePlugins(merge).forEach(plugin => {
            xelib.WithEachHandle(getAllRecords(plugin), rec => {
                if (xelib.IsOverride(rec) || xelib.IsInjected(rec)) return;
                merge.usedFids[getFid(rec)] = false;
            });
        });
    };

    let renumberFormIds = function(merge) {
        merge.nextFormId = '000801';
        getMergePlugins(merge).forEach(plugin => {
            let pluginName = xelib.Name(plugin);
            merge.fidMap[pluginName] = renumberPluginRecords(plugin, merge);
        });
    };

    let copyRecords = function(merge, allowNew) {
        getMergePlugins(merge).forEachReverse(plugin => {
            let pluginName = xelib.Name(plugin),
                fidMap = copyPluginRecords(plugin, merge, allowNew);
            if (allowNew) merge.fidMap[pluginName] = fidMap;
        });
    };

    let clampRecords = function(merge) {
        merge.fidMap = {};
        getUsedFormIds(merge);
        renumberFormIds(merge);
        copyRecords(merge, false);
    };

    let refactorRecords = function(merge) {
        merge.fidMap = {};
        copyRecords(merge, true);
        xelib.RefactorReferences(merge.plugin, merge.fidMap);
    };

    // PUBLIC API
    this.mergeRecords = function(merge) {
        if (merge.method === 'refactor') {
            refactorRecords(merge);
        } else {
            clampRecords(merge);
        }
    };
});