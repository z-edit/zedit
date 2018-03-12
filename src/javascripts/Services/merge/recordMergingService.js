ngapp.service('recordMergingService', function() {
    let getFid = (rec) => { return xelib.GetHexFormID(rec, false, true) };
    let getMergePlugins = (merge) => { return merge.plugins.mapOnKey('handle') };

    let copyPluginRecords = function(plugin, merge, allowNew) {
        let fidMap = {};
        xelib.GetRecords(plugin).forEach(function(rec) {
            let asNew = allowNew && xelib.IsMaster(rec),
                newRec = xelib.CopyElement(rec, merge.plugin, asNew);
            if (!asNew) return;
            fidMap[getFid(rec)] = getFid(newRec);
        });
        return fidMap;
    };

    let getNextFormId = function(merge) {
        while (merge.usedFids.hasOwnProperty(merge.nextFormId))
            merge.nextFormId = xelib.Hex(parseInt(merge.nextFormId, 16) + 1);
        merge.usedFids[merge.nextFormId] = true;
        return parseInt(merge.nextFormId++, 16);
    };

    let renumberPluginRecords = function(plugin, merge) {
        let fidMap = {},
            loadOrdinal = xelib.GetFileLoadOrder(plugin) << 24;
        xelib.GetRecords(plugin).forEach(function(rec) {
            if (!xelib.IsMaster(rec)) return;
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
        getMergePlugins(merge).forEach(function(plugin) {
            xelib.GetRecords(plugin).forEach(function(rec) {
                if (!xelib.IsMaster(rec)) return;
                merge.usedFids[getFid(rec)] = false;
            });
        });
    };

    let renumberFormIds = function(merge) {
        merge.nextFormId = '00000801';
        getMergePlugins(merge).forEach(function(plugin) {
            let pluginName = xelib.Name(plugin);
            merge.fidMap[pluginName] = renumberPluginRecords(plugin, merge);
        });
    };

    let copyRecords = function(merge, allowNew) {
        getMergePlugins(merge).forEach(function(plugin) {
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