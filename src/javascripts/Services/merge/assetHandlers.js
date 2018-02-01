ngapp.run(function(mergeAssetHandler, scriptHelpers) {
    let handler = mergeAssetHandler;

    let faceDataExpr = /([0-9A-F]{8})\.(nif|dds)/i,
        voiceDataExpr = /_([0-9A-F]{8})_[0-9]\.(fuz|wav)/i,
        fragmentExpr = /_([0-9A-F]{8})\.pex/i;

    let handleArchives = function(merge) {
        merge.archives.forEach(function(archive) {
            if (archive.action !== 'ignore') return;
            let archiveFileName = fh.getFileName(archive.filePath),
                newPath = `${merge.dataPath}\\${archiveFileName}`;
            fh.jetpack.copy(archive.filePath, newPath);
        });
    };

    let handleFaceDataFiles = function(merge) {
        merge.faceDataFiles.forEach(function(asset) {
            handler.copyAsset(asset, merge, faceDataExpr);
        });
    };

    let handleVoiceDataFiles = function(merge) {
        merge.voiceDataFiles.forEach(function(asset) {
            handler.copyAsset(asset, merge, voiceDataExpr);
        });
    };

    let fixSource = function(sourcePath, asset, merge) {
        // TODO
    };

    let handleScriptFragments = function(merge) {
        merge.scriptFragments.forEach(function(asset) {
            let scriptPath = handler.getOldPath(asset, merge),
                sourcePath = scriptHelpers.getScriptSource(scriptPath),
                newPath = handler.getNewPath(asset, merge, fragmentExpr, true);
            sourcePath = fixSource(sourcePath, asset, merge);
            scriptHelpers.compileScript(sourcePath, newPath);
        });
    };

    let handleStringFiles = function(merge) {
        merge.stringFiles.forEach(function(asset) {
            // TODO
        });
    };

    let loadTranslations = function(merge, translations) {
        merge.translations.forEach(function(asset) {
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
        translations.forEach(function(language) {
            let basePath = `${merge.dataPath}\\interface\\translations`,
                filename = `${fh.getFileBase(merge.filename)}${language}`,
                content = translations[language];
            fh.saveTextFile(`${basePath}\\${filename}`, content);
        });
    };

    let handleTranslations = function(merge) {
        let translations = {};
        loadTranslations(merge, translations);
        saveTranslations(merge, translations);
    };

    let handleIniFiles = function(merge) {
        merge.iniFiles.forEach(function(asset) {
            // TODO
        });
    };

    let handleGeneralAssets = function(merge) {
        merge.generalAssets.forEach(function(asset) {
            handler.copyAsset(asset, merge, null, true);
        });
    };

    mergeAssetHandler.assetSteps.push(
        handleArchives, handleFaceDataFiles, handleVoiceDataFiles,
        handleScriptFragments, handleStringFiles, handleTranslations,
        handleIniFiles, handleGeneralAssets
    );
});