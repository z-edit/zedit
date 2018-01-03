ngapp.service('assetService', function(bsaHelpers) {
    let service = this;

    let faceGeomPath = 'meshes\\actors\\character\\facegendata\\facegeom\\',
        faceTintPath = 'textures\\actors\\character\\facegendata\\facetint\\',
        voicePath = 'sound\\voice\\',
        translationPath = 'interface\\translations\\';

    let fragmentPathNames = {
        SCEN: 'Scene',
        QUST: 'Quest',
        INFO: 'Info'
    };

    let findGameAssets = function(plugin, folder, subfolder, expr) {
        let assets = fh.getFiles(folder + subfolder, { matching: expr }),
            fullExpr = `${subfolder}/${expr}`;
        service.getBsaFiles(plugin, folder).forEach(function(bsaPath) {
            if (fh.getFileExt(bsaPath) === 'bsl') return;
            bsaHelpers.find(bsaPath, fullExpr).forEach(function(assetPath) {
                assets.push(`${bsaPath}/${assetPath}`);
            });
        });
        return assets;
    };

    let getFragmentsPath = function(group) {
        let name = fragmentPathNames[group];
        return `VMAD - Virtual Machine Adapter\\Data\\${name} VMAD\\` +
            `Script Fragments ${name}`;
    };

    // TODO: Check if script fragment file exists for override records
    let getFragmentsFromPlugin = function(pluginFile, folder, group) {
        let fragmentPath = getFragmentsPath(group),
            records = xelib.GetRecords(pluginFile, group, true);
        try {
            return records.reduce(function(items, record) {
                let fragment = xelib.GetElement(record, fragmentPath);
                if (fragment) items.push({
                    formId: xelib.GetFormID(record),
                    name: xelib.LongName(record),
                    filename: xelib.GetValue(fragment, 'fileName')
                });
                return items;
            }, []);
        } finally {
            records.forEach(xelib.Release);
        }
    };

    this.getBsaFiles = function(plugin, folder) {
        return fh.filterExists(folder, [
            `${fh.getFileBase(plugin)}.bsa`,
            `${fh.getFileBase(plugin)}.bsl`,
            `${fh.getFileBase(plugin)}.ba2`
        ]);
    };

    this.getFaceData = function(plugin, folder) {
        return Array.prototype.concat(
            findGameAssets(plugin, folder, faceTintPath + plugin, '*'),
            findGameAssets(plugin, folder, faceGeomPath + plugin, '*')
        );
    };

    this.getVoiceData = function(plugin, folder) {
        return findGameAssets(plugin, folder, voicePath + plugin, `**/*`);
    };

    this.getScriptFragments = function(plugin, folder) {
        let pluginFile = xelib.FileByName(plugin);
        if (!pluginFile) return [];
        return Array.prototype.concat(
            getFragmentsFromPlugin(pluginFile, folder, 'SCEN'),
            getFragmentsFromPlugin(pluginFile, folder, 'QUST'),
            getFragmentsFromPlugin(pluginFile, folder, 'INFO')
        );
    };

    this.getStringFiles = function(plugin, folder) {
        return findGameAssets(plugin, folder, 'strings',
            `${fh.getFileBase(plugin)}*.?(DL|IL)STRINGS`);
    };

    this.getMcmTranslations = function(plugin, folder) {
        return fh.getFiles(folder + translationPath, {
            matching: `${fh.getFileBase(plugin)}*.txt`
        });
    };

    this.getIniFiles = function(plugin, folder) {
        return fh.filterExists(folder, [
            `${fh.getFileBase(plugin)}.ini`
        ]);
    };

    this.getGeneralAssets = function(folder) {
        let rules = ['**/*', '!*.@(esp|esm|bsa|ba2|bsl)', '!meta.ini',
            '!translations/**/*', '!TES5Edit Backups/**/*'];
        fh.jetpack.find(folder, {
            matching: '*.@(esp|esm)'
        }).forEach(function(pluginPath) {
            let plugin = fh.getFileName(pluginPath),
                basePluginName = fh.getFileBase(plugin);
            rules.push(`**/${basePluginName}.@(seq|ini)`, `!**/${plugin}/**/*`);
        });
        return fh.jetpack.find(folder, { matching: rules });
    };
});
