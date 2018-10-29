ngapp.run(function(mergeAssetService, assetHelpers, pexService, progressLogger) {
    let {getOldPath, getNewPath, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    const fragmentGroups = ['QUST', 'INFO', 'SCEN', 'PERK', 'PACK'],
          fragmentPath = 'VMAD\\Script Fragments\\fileName';

    let fragmentExpr = /.*scripts[\/\\].*(qf|tif|sf|prkf|pf)_.*_[a-f0-9]{8}.pex/i;

    let getPluginHandle = function(merge, filename) {
        let plugin = merge.plugins.findByKey('filename', filename);
        return plugin ? plugin.handle : 0;
    };

    let getFragmentsFromPlugin = function(pluginFile, group, fragments = []) {
        let records = xelib.GetRecords(pluginFile, group, true);
        xelib.WithEachHandle(records, record => {
            let handle = xelib.GetElement(record, fragmentPath);
            if (handle) fragments.push({
                handle: handle,
                record: xelib.LongName(record),
                filename: xelib.GetValue(handle) + '.pex'
            });
        });
        return fragments;
    };

    let getFragmentsFromDisk = function(plugin, folder) {
        if (folder === xelib.GetGlobal('DataFolder')) return;
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
                return f.filename === fragment.filename;
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

    let fixFragment = function(merge, entry, a) {
        let asset = buildFragmentAssetObj(entry, a),
            oldPath = getOldPath(asset, merge),
            newPath = getNewPath(asset, merge, fragmentExpr, true),
            fileName = fh.getFileBase(newPath),
            script = pexService.loadScript(oldPath);
        script.stringTable[0] = fileName;
        fh.jetpack.dir(fh.getDirectory(newPath));
        pexService.saveScript(script, newPath);
        xelib.SetValue(a.handle, fileName);
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
            progressLogger.log('Handling Script Fragments');
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
