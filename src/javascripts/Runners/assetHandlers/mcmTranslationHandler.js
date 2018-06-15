ngapp.run(function(mergeAssetService, mergeLogger) {
    let {forEachPlugin} = mergeAssetService;

    let translationPath = 'interface\\translations\\';

    let loadTranslations = function(merge, translations) {
        merge.translations.forEach(asset => {
            let fullPath = merge.dataFolders[asset.plugin] + asset.filePath,
                content = fh.loadTextFile(fullPath),
                language = fh.getFileBase(asset.filePath)
                    .replace(fh.getFileBase(asset.plugin), '');
            if (translations.hasOwnProperty(language)) {
                translations[language] += '\r\n\r\n' + content;
            } else {
                translations[language] = content;
            }
        });
    };

    let saveTranslations = function(merge, translations) {
        Object.keys(translations).forEach(language => {
            let basePath = `${merge.dataPath}\\interface\\translations`,
                filename = `${fh.getFileBase(merge.filename)}${language}`,
                content = translations[language];
            fh.saveTextFile(`${basePath}\\${filename}`, content);
        });
    };

    let findMcmTranslations = function(plugin, folder) {
        return fh.getFiles(folder + translationPath, {
            matching: `${fh.getFileBase(plugin)}*.txt`
        });
    };

    mergeAssetService.addHandler({
        label: 'MCM Translation Files',
        priority: 0,
        get: function(merge) {
            forEachPlugin(merge, (plugin, folder) => {
                let sliceLen = folder.length;
                findMcmTranslations(plugin, folder).forEach(filePath => {
                    merge.translations.push({
                        plugin: plugin,
                        filePath: filePath.slice(sliceLen)
                    });
                });
            });
        },
        handle: function(merge) {
            if (!merge.handleTranslations || !merge.translations.length) return;
            mergeLogger.log(`Handling MCM Translation Files`);
            let translations = {};
            loadTranslations(merge, translations);
            saveTranslations(merge, translations);
        }
    });
});