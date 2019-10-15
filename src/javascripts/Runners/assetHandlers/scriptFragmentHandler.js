ngapp.run(function(mergeAssetService, assetHelpers, pexService, progressLogger, gameService) {
    let {getOldPath, getNewPath, findGameAssets} = assetHelpers,
        {GetRecords, WithHandle, GetElement, Release, LongName,
         GetValue, GetHexFormID, GetRecord, SetValue, GetElements} = xelib,
        {loadScript, saveScript, setLogger} = pexService,
        {forEachPlugin} = mergeAssetService,
        {log} = progressLogger;

    const fragmentGroups = ['QUST', 'INFO', 'SCEN', 'PERK', 'PACK'],
        fragmentsPath = 'VMAD\\Script Fragments';

    let fragmentExpr = /.*scripts[\/\\].*_([a-f0-9]{8}).pex/i;

    let getPluginHandle = function(merge, filename) {
        let plugin = merge.plugins.findByKey('filename', filename);
        return plugin ? plugin.handle : 0;
    };

    let getFragmentsFromPlugin = function(pluginFile, group, fragments = []) {
        let records = GetRecords(pluginFile, group, true);
        records.forEach(record => {
            WithHandle(GetElement(record, fragmentsPath), handle => {
                if (!handle) return Release(record);
                fragments.push({
                    handle: record,
                    record: LongName(record),
                    filename: GetValue(handle, 'fileName') + '.pex'
                });
            });
        });
        return fragments;
    };

    let getFragmentsFromDisk = function(plugin, folder) {
        if (folder === gameService.dataPath) return [];
        let folderLen = folder.length;
        return findGameAssets(plugin, folder, 'Scripts', '*.pex')
            .filter(filePath => fragmentExpr.test(filePath))
            .map(filePath => ({
                filename: fh.getFileName(filePath),
                filePath: filePath.slice(folderLen)
            }));
    };

    let findScriptFragments = function(merge, plugin, folder) {
        let pluginFile = getPluginHandle(merge, plugin),
            fragmentFiles = getFragmentsFromDisk(plugin, folder);
        if (!pluginFile) return fragmentFiles;
        return fragmentGroups.reduce((fragments, group) => {
            return getFragmentsFromPlugin(pluginFile, group, fragments);
        }, []).filter(fragment => {
            let fragmentFile = fragmentFiles.find(f => {
                return f.filename.equals(fragment.filename, true);
            });
            if (!fragmentFile) return;
            fragment.filePath = fragmentFile.filePath;
            return true;
        });
    };

    let buildFragmentAssetObj = (entry, a) => ({
        plugin: entry.plugin,
        folder: entry.folder,
        filePath: a.filePath
    });

    let getMergeRecord = function(merge, entry, rec) {
        let fidMap = merge.fidMap[entry.plugin],
            oldFid = GetHexFormID(rec, false, true),
            newFid = fidMap[oldFid] || oldFid,
            targetPlugin = merge.method === 'Clobber' ?
                entry.plugin : merge.filename,
            ordinal = merge.ordinals[targetPlugin],
            formId = ordinal * 0x1000000 + parseInt(newFid, 16);
        return GetRecord(merge.plugin, formId, false);
    };

    let fixFragment = function(merge, entry, a) {
        let asset = buildFragmentAssetObj(entry, a),
            oldPath = getOldPath(asset, merge),
            newPath = getNewPath(asset, merge, fragmentExpr, true),
            fileName = fh.getFileBase(newPath),
            script = loadScript(oldPath);
        log(`Recompiling ${oldPath}, new filename: ${fileName}`, true);
        script.stringTable[0] = fileName;
        fh.jetpack.dir(fh.getDirectory(newPath));
        saveScript(script, newPath);
        let mergeRecord = getMergeRecord(merge, entry, a.handle),
            fragments = GetElement(mergeRecord, fragmentsPath);
        SetValue(fragments, 'fileName', fileName);
        GetElements(fragments, 'Fragments').forEach(fragment => {
            SetValue(fragment, 'scriptName', fileName);
        });
    };

    mergeAssetService.addHandler({
        label: 'Script Fragments',
        priority: 1,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let assets = findScriptFragments(merge, plugin, folder);
                if (assets.length === 0) return;
                merge.scriptFragments.push({ plugin, folder, assets });
            });
        },
        handle: function(merge) {
            if (!merge.handleScriptFragments ||
                !merge.scriptFragments.length) return;
            log('Handling Script Fragments');
            setLogger(progressLogger);
            merge.scriptFragments.forEach(entry => {
                entry.assets.forEach(asset => {
                    fixFragment(merge, entry, asset);
                });
            });
        },
        cleanup: function(merge) {
            merge.scriptFragments.forEach(entry => {
                entry.assets.forEach(asset => {
                    if (asset.handle) xelib.Release(asset.handle);
                });
            });
        }
    });
});
