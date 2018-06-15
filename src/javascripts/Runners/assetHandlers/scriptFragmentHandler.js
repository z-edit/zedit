ngapp.run(function(mergeAssetService, assetHelpers, scriptHelpers, mergeLogger) {
    let {getOldPath, getNewPath} = assetHelpers,
        {getScriptSource, compileScript} = scriptHelpers,
        {forEachPlugin} = mergeAssetService;

    let fragmentPathNames = {
        SCEN: 'Scene',
        QUST: 'Quest',
        INFO: 'Info'
    };

    let fixSource = function(sourcePath, asset, merge) {
        // TODO
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

    let findScriptFragments = function(plugin, folder) {
        let pluginFile = xelib.FileByName(plugin);
        if (!pluginFile) return [];
        return Array.prototype.concat(
            getFragmentsFromPlugin(pluginFile, folder, 'SCEN'),
            getFragmentsFromPlugin(pluginFile, folder, 'QUST'),
            getFragmentsFromPlugin(pluginFile, folder, 'INFO')
        );
    };

    mergeAssetService.addHandler({
        label: 'Script Fragments',
        priority: 1,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                findScriptFragments(plugin, folder).forEach(fragment => {
                    merge.scriptFragments.push({
                        plugin: plugin,
                        filePath: fragment.filename,
                        record: fragment.name,
                        formId: fragment.formID
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleScriptFragments ||
                !merge.scriptFragments.length) return;
            mergeLogger.log('Handling Script Fragments');
            merge.scriptFragments.forEach(asset => {
                let scriptPath = getOldPath(asset, merge),
                    sourcePath = getScriptSource(scriptPath),
                    newPath = getNewPath(asset, merge, fragmentExpr, true);
                sourcePath = fixSource(sourcePath, asset, merge);
                compileScript(sourcePath, newPath);
            });
        }
    });
});