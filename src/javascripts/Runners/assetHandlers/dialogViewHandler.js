ngapp.run(function(mergeAssetService, progressLogger, assetHelpers) {
    let {findGameAssets, getOldPath, getNewPath} = assetHelpers,
        {log} = progressLogger;

    const dialogViewPath = 'DialogueViews',
          dialogViewExpr =  /^([0-9A-F]{8}).xml$/i,
          tooltipExpr = /^([0-9A-F]{8})/i;

    let getDialogViewsFromPlugin = function(pluginFile) {
        let dialogViews = [],
            records = xelib.GetRecords(pluginFile, 'DLVW', true);
        xelib.WithEachHandle(records, record => {
            dialogViews.push({
                handle: record,
                record: xelib.LongName(record),
                filename: xelib.GetHexFormID(record, true) + '.xml'
            });
        });
        return dialogViews;
    };

    let getDialogViewsFromDisk = function(plugin, folder) {
        if (folder === gameService.dataPath) return [];
        let sliceLen = folder.length;
        return findGameAssets(plugin, folder, dialogViewPath, '*.xml')
            .map(filePath => ({
                filename: fh.getFileName(filePath),
                filePath: filePath.slice(sliceLen)
            }));
    };

    let findDialogViews = function(merge, plugin, folder) {
        let pluginFile = getPluginHandle(merge, plugin),
            dialogViews = getDialogViewsFromDisk(plugin, folder);
        if (!pluginFile) return dialogViews;
        return getDialogViewsFromPlugin(pluginFile).filter(dialogView => {
            let dialogViewFile = dialogViews.find(f => {
                return f.filename.equals(dialogView.filename, true);
            });
            if (!dialogViewFile) return;
            dialogViewFile.filePath = dialogView.filePath;
            return true;
        });
    };

    let rewriteTooltips = function(asset, merge, doc) {
        let tooltips = doc.getElementsbyTagName('ToolTip');
        Array.from(tooltips).forEach(tooltip => {
            tooltip.textContent = tooltip.textContent.replace(
                tooltipExpr, merge.fidReplacer[asset.plugin]
            );
        });
    };

    let modifyXml = function(filePath, callback) {
        let text = fh.loadTextFile(filePath),
            doc = new DOMParser().parseFromString(text),
            serializer = new XMLSerializer();
        callback(doc);
        return serializer.serializeToString(doc);
    };

    let handleDialogView = function(asset, merge) {
        let oldPath = getOldPath(asset, merge),
            newPath = getNewPath(asset, merge, dialogViewExpr, true);
        log(`Rewriting ${oldPath}, saving to ${newPath}`, true);
        fh.saveTextFile(newPath, modifyXml(oldPath, doc => {
            rewriteTooltips(asset, merge, doc)
        }));
    };

   mergeAssetService.addHandler({
       label: 'Dialog Views',
       priority: 0,
       get: function(merge) {
           mergeAssetService.forEachPlugin(merge, (plugin, folder) => {
               let assets = findDialogViews(merge, plugin, folder);
               if (assets.length === 0) return;
               merge.dialogViews.push({ plugin, folder, assets });
           }, { useGameDataFolder: true });
       },
       handle: function(merge) {
           if (!merge.handleDialogViews || !merge.dialogViews.length) return;
           log(`Handling Dialog View Files`);
           merge.dialogViews.forEach(entry => {
               entry.assets.forEach(asset => {
                    handleDialogView({
                        plugin: entry.plugin,
                        folder: entry.folder,
                        filePath: asset.filePath
                    }, merge);
               });
           });
       }
   })
});
