ngapp.run(function(mergeAssetService, assetHelpers, pexService, mergeLogger) {
    let {getOldPath, getNewPath, findGameAssets} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    let fragmentExpr = /.*scripts[\/\\].*(qf|tif|sf)_.*_[a-f0-9]{8}.pex/i;

    let fragmentPathNames = {
        SCEN: 'Scene',
        QUST: 'Quest',
        INFO: 'Info'
    };

    let fixFragment = function(oldPath, newPath) {
        let script = pexService.loadScript(oldPath);
        script.stringTable[0] = fh.getFileBase(oldPath);
        script.filePath = newPath;
        pexService.saveScript(script);
    };

    let getFragmentsPath = function(group) {
        let name = fragmentPathNames[group];
        return `VMAD - Virtual Machine Adapter\\Data\\${name} VMAD\\` +
            `Script Fragments ${name}`;
    };

    let getFragmentsFromPlugin = function(pluginFile, folder, group) {
        let fragmentPath = getFragmentsPath(group),
            records = xelib.GetRecords(pluginFile, group, true),
            fragments = [];
        xelib.WithEachHandle(records, function(record) {
            let fragment = xelib.GetElement(record, fragmentPath);
            if (!fragment) return;
            fragments.push({
                formId: xelib.GetFormID(record),
                name: xelib.LongName(record),
                filename: xelib.GetValue(fragment, 'fileName')
            });
        });
        return fragments;
    };

    let getFragmentsFromDisk = function(plugin, folder) {
        let folderLen = folder.length;
        return findGameAssets(plugin, folder, 'scripts', '*.pex')
            .filter(filePath => fragmentExpr.test(filePath))
            .map(filePath => ({ filePath: filePath.slice(folderLen) }));
    };

    let findScriptFragments = function(plugin, folder) {
        let pluginFile = xelib.FileByName(plugin);
        if (!pluginFile) return getFragmentsFromDisk(plugin, folder);
        return Array.prototype.concat(
            getFragmentsFromPlugin(pluginFile, folder, 'SCEN'),
            getFragmentsFromPlugin(pluginFile, folder, 'QUST'),
            getFragmentsFromPlugin(pluginFile, folder, 'INFO')
        ).map(fragment => ({
            filePath: fragment.filename,
            record: fragment.name,
            formId: fragment.formID
        }));
    };

    mergeAssetService.addHandler({
        label: 'Script Fragments',
        priority: 1,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let assets = findScriptFragments(plugin, folder);
                if (assets.length === 0) return;
                merge.scriptFragments.push({ plugin, folder, assets });
            });
        },
        handle: function(merge) {
            if (!merge.handleScriptFragments ||
                !merge.scriptFragments.length) return;
            mergeLogger.log('Handling Script Fragments');
            merge.scriptFragments.forEach(entry => {
                entry.assets.forEach(asset => {
                    let oldPath = getOldPath(asset, merge),
                        newPath = getNewPath(asset, merge, fragmentExpr, true);
                    fixFragment(oldPath, newPath);
                });
            });
        }
    });
});
