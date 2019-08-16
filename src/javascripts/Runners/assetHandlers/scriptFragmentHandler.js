ngapp.run(function(mergeAssetService, assetHelpers, pexService, progressLogger, gameService) {
    let {getOldPath, getNewPath, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService,
        {log} = progressLogger;

    const fragmentGroups = ['QUST', 'INFO', 'SCEN', 'PERK', 'PACK'],
          fragmentPath = 'VMAD';

    let fragmentExpr = /.*scripts[\/\\].*_([a-f0-9]{8}).pex/i;

    let mergedPluginFragments = [];

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
                filename: xelib.GetValue(handle, 'Script Fragments\\fileName') + '.pex'
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

    let findScriptFragments = function(merge, plugin, folder, useMergePlugin) {
        let pluginFile = getPluginHandle(merge, plugin),
            fragmentFiles = getFragmentsFromDisk(plugin, folder);
        if (!pluginFile) return fragmentFiles;
        if (!useMergePlugin || !mergedPluginFragments || !mergedPluginFragments.length) {
            mergedPluginFragments = fragmentGroups.reduce((fragments, group) => {
                return getFragmentsFromPlugin(useMergePlugin ? merge.plugin : pluginFile, group, fragments);
            }, []);
        }
        return mergedPluginFragments.filter(fragment => {
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

    let fixFragment = function(merge, entry, a) {
        let asset = buildFragmentAssetObj(entry, a),
            oldPath = getOldPath(asset, merge),
            newPath = getNewPath(asset, merge, fragmentExpr, true),
            fileName = fh.getFileBase(newPath),
            script = pexService.loadScript(oldPath);
        script.stringTable[0] = fileName;
        fh.jetpack.dir(fh.getDirectory(newPath));
        pexService.saveScript(script, newPath);
        let oldFileName = xelib.GetValue(a.handle, `Script Fragments\\fileName`);
        log(`Changing fragment fileName from ${oldFileName} to ${fileName}`);
        xelib.SetValue(a.handle, 'Script Fragments\\fileName', fileName);
        let fragmentHandle = xelib.GetElement(a.handle, 'Script Fragments\\Fragments');
        if (fragmentHandle) {
            let numberOfFragments = xelib.ElementCount(fragmentHandle);
            log(`Found ${numberOfFragments} fragments to fix for ${fileName}`);
            for (let i = 0; i < numberOfFragments; i++) {
                let oldValue = xelib.GetValue(a.handle, `Script Fragments\\Fragments\\[${i}]\\scriptName`);
                if (oldValue === oldFileName) { 
                    log(`Changing fragment ${i} scriptName from ${oldValue} to ${fileName}`);
                    xelib.SetValue(a.handle, `Script Fragments\\Fragments\\[${i}]\\scriptName`, fileName);
                } else {
                    log(`Not changing fragment ${i} scriptName from ${oldValue} to ${fileName} (different script)`);
                }
            }
        }
        let scriptHandle = xelib.GetElement(a.handle, 'Scripts');
        if (scriptHandle) {
            let numberOfScripts = xelib.ElementCount(scriptHandle);
            log(`Found ${numberOfScripts} scripts to fix for ${fileName}`);
            for (let i = 0; i < numberOfScripts; i++) {
                let oldValue = xelib.GetValue(a.handle, `Scripts\\[${i}]\\scriptName`);
                if (oldValue === oldFileName) {
                    log(`Changing script ${i} scriptName from ${oldValue} to ${fileName}`);
                    xelib.SetValue(a.handle, `Scripts\\[${i}]\\scriptName`, fileName);
                } else {
                    log(`Not changing script ${i} scriptName from ${oldValue} to ${fileName} (different script)`);
                }
            }
        }
    };

    mergeAssetService.addHandler({
        label: 'Script Fragments',
        priority: 1,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let assets = findScriptFragments(merge, plugin, folder, false);
                if (assets.length === 0) return;
                merge.scriptFragments.push({ plugin, folder, assets });
            });
        },
        handle: function(merge) {
            progressLogger.log('Handling Script Fragments');
            merge.scriptFragments = [];
            mergedPluginFragments = [];
            forEachPlugin(merge, (plugin, folder) => {
                let assets = findScriptFragments(merge, plugin, folder, true);
                if (assets.length === 0) return;
                merge.scriptFragments.push({ plugin, folder, assets });
            });
            if (!merge.handleScriptFragments ||
                !merge.scriptFragments.length) return;
            pexService.setLogger(progressLogger);
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
