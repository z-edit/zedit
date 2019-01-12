ngapp.run(function(mergeAssetService, assetHelpers, progressLogger) {
    let {findGameAssets, getOldPath} = assetHelpers,
        {forEachPlugin} = mergeAssetService;

    const utf16marker = String.fromCharCode(65279),
          translationPath = 'interface\\translations\\';

    let loadTranslations = function(merge, translations) {
        merge.translations.forEach(entry => {
            entry.assets.forEach(asset => {
                let fullPath = getOldPath({
                        folder: entry.folder,
                        filePath: asset.filePath
                    }, merge),
                    content = fh.loadTextFile(fullPath, 'ucs2').slice(1),
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
                filename = `${baseName}${language}.txt`,
                content = utf16marker + translations[language];
            fh.saveTextFile(`${basePath}\\${filename}`, content, 'ucs2');
        });
    };

    let findMcmTranslations = function(plugin, folder) {
        let sliceLen = folder.length,
            expr = `${fh.getFileBase(plugin)}*.txt`;
        return findGameAssets(plugin, folder, translationPath, expr)
            .map(filePath => ({ filePath: filePath.slice(sliceLen) }));
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
