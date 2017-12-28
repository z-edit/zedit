ngapp.service('assetService', function(bsaHelpers) {
    let service = this;

    let faceGeomPath = 'meshes/actors/character/facegendata/facegeom/',
        faceTintPath = 'textures/actors/character/facegendata/facetint/',
        voicePath = 'sound/voice/',
        translationPath = 'interface/translations/';

    let fragmentPathNames = {
        SCEN: 'Scene',
        QUST: 'Quest',
        INFO: 'Info'
    };

    let findGameAssets = function(plugin, folder, expr) {
        let assets = fh.jetpack.find(folder, { matching: expr });
        service.getBsaFiles(plugin, folder).forEach(function(bsaPath) {
            if (fh.getFileExt(bsaPath) === 'bsl') return;
            bsaHelpers.find(bsaPath, expr).forEach(function(assetPath) {
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
    let getFragments = function(pluginFile, folder, group) {
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
        return fh.jetpack.find(folder, {
            matching: `${fh.getFileBase(plugin)}.@(bsa|ba2|bsl)`
        });
    };

    this.getFaceData = function(plugin, folder) {
        return Array.prototype.concat(
            findGameAssets(plugin, folder, `${faceTintPath}${plugin}/*`),
            findGameAssets(plugin, folder, `${faceGeomPath}${plugin}/*`)
        );
    };

    this.getVoiceData = function(plugin, folder) {
        return findGameAssets(plugin, folder, `${voicePath}${plugin}/**/*`);
    };

    this.getScriptFragments = function(pluginFile, folder) {
        return Array.prototype.concat(
            getFragments(pluginFile, folder, 'SCEN'),
            getFragments(pluginFile, folder, 'QUST'),
            getFragments(pluginFile, folder, 'INFO')
        );
    };

    this.getStringFiles = function(plugin, folder) {
        return findGameAssets(plugin, folder,
            `strings/${fh.getFileBase(plugin)}*.?(DL|IL)STRINGS`);
    };

    this.getMcmTranslations = function(plugin, folder) {
        return fh.jetpack.find(folder, {
            matching: `${translationPath}${fh.getFileBase(plugin)}*.txt`
        });
    };

    this.getIniFiles = function(plugin, folder) {
        return fh.jetpack.find(folder, {
            matching: `${fh.getFileBase(plugin)}.ini`
        });
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
