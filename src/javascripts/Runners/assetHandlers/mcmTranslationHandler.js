ngapp.run(function(mergeAssetService, progressLogger) {
    let {forEachPlugin} = mergeAssetService;

    let translationPath = 'interface\\translations\\';

    let loadTranslations = function(merge, translations) {
        merge.translations.forEach(entry => {
            let dataFolder = merge.dataFolders[entry.plugin];
            entry.assets.forEach(asset => {
                let fullPath = dataFolder + asset.filePath,
                    content = fh.loadTextFile(fullPath),
                    baseName = fh.getFileBase(entry.plugin).toLowerCase(),
                    language = fh.getFileBase(asset.filePath)
                        .toLowerCase().replace(baseName, '');
                if (translations.hasOwnProperty(language)) {
                    translations[language] += '\r\n\r\n' + content;
                } else {
                    translations[language] = content;
                }
            });
        });
    };

    let saveTranslations = function(merge, translations) {
        Object.keys(translations).forEach(language => {
            let basePath = `${merge.dataPath}\\interface\\translations`,
                baseName = fh.getFileBase(merge.filename).toLowerCase(),
                filename = `${baseName}${language}`,
                content = translations[language];
            fh.saveTextFile(`${basePath}\\${filename}`, content);
        });
    };

    let findMcmTranslations = function(plugin, folder) {
        let sliceLen = folder.length;
        return fh.getFiles(folder + translationPath, {
            matching: `${fh.getFileBase(plugin)}*.txt`
        }).map(filePath => ({
            filePath: filePath.slice(sliceLen)
        }));
    };

    mergeAssetService.addHandler({
        label: 'MCM Translation Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let assets = findMcmTranslations(plugin, folder);
                if (assets.length === 0) return;
                merge.translations.push({ plugin, folder, assets });
            }, { useGameDataFolder: true });
        },
        handle: function(merge) {
            if (!merge.handleTranslations || !merge.translations.length) return;
            progressLogger.log(`Handling MCM Translation Files`);
            let translations = {};
            loadTranslations(merge, translations);
            saveTranslations(merge, translations);
        }
    });
});
