ngapp.service('mergeService', function(settingsService, mergeDataService, objectUtils) {
    let service = this,
        mergeExportKeys = [
            'name', 'filename', 'method', 'useGameLoadOrder', 'loadOrder',
            'buildMergedArchive', 'archiveAction', 'handleFaceData',
            'handleVoiceData', 'handleBillboards', 'handleStringFiles',
            'handleTranslations', 'handleIniFiles', 'handleDialogViews',
            'copyGeneralAssets', 'dateBuilt', 'customMetadata'],
        pluginExportKeys = ['filename', 'hash', 'dataFolder'],
        mergeMethodMap = { Clamp: 'Clobber', Refactor: 'Clean' };

    // private functions
    let initMergeData = mergeDataService.clearMergeData;

    let getMergePath = function() {
        let mergePath = settingsService.settings.mergePath;
        fh.jetpack.dir(mergePath);
        return mergePath;
    };

    let getNewMergeName = function() {
        let mergeName = 'New Merge',
            counter = 1,
            mergePath = getMergePath(),
            directories = fh.getDirectories(mergePath).map(fh.getFileName);
        while (directories.includes(mergeName))
            mergeName = `New Merge ${++counter}`;
        return mergeName;
    };

    let exportMerge = function(merge) {
        let mergeObj = objectUtils.rebuildObject(merge, mergeExportKeys);
        mergeObj.plugins = merge.plugins.map(plugin => {
            return objectUtils.rebuildObject(plugin, pluginExportKeys);
        });
        return mergeObj;
    };

    let exportMergeData = function() {
        return service.merges.map(exportMerge);
    };

    let getFidCache = function(merge) {
        let fids = merge.plugins.map(() => []);
        Object.keys(merge.usedFids).forEach(key => {
            let index = merge.usedFids[key];
            if (index > -1) fids[index].push(key);
        });
        return fids.reduce((obj, a, index) => {
            let filename = merge.plugins[index].filename;
            obj[filename] = a;
            return obj;
        }, {});
    };

    let importPluginData = function(plugin) {
        mergeDataService.updatePluginDataFolder(plugin);
        let pluginPath = fh.path(plugin.dataFolder, plugin.filename);
        plugin.hash = fh.getMd5Hash(pluginPath);
    };

    let importMergeData = function(merge) {
        let mergeFolder = service.getMergeFolder(merge),
            oldMerge = fh.loadJsonFile(fh.path(mergeFolder, 'merge.json'));
        merge = Object.assign(service.newMerge(), merge);
        merge.method = mergeMethodMap[merge.method] || merge.method;
        if (merge.archiveAction === 'Merge') {
            merge.buildMergedArchive = true;
            merge.archiveAction = 'Extract';
        }
        merge.oldPlugins = oldMerge && oldMerge.plugins;
        merge.plugins.forEach(importPluginData);
        return merge;
    };

    // public api
    this.getMergeFolder = function(merge) {
        let baseFolder = fh.path(getMergePath(), merge.name);
        let mergeFolders = fh.getFiles(baseFolder, {
            matching: 'merge*',
            directories: true,
            files: false
        });
        return mergeFolders[0] || fh.path(baseFolder, 'merge');
    };

    this.newMerge = function() {
        let mergeName = getNewMergeName();
        return initMergeData({
            name: mergeName,
            filename: `${mergeName}.esp`,
            method: 'Clobber',
            plugins: [],
            loadOrder: [],
            archiveAction: 'Extract',
            buildMergedArchive: false,
            useGameLoadOrder: false,
            handleFaceData: true,
            handleVoiceData: true,
            handleBillboards: true,
            handleStringFiles: true,
            handleTranslations: true,
            handleIniFiles: true,
            handleDialogViews: true,
            copyGeneralAssets: false,
            customMetadata: {}
        });
    };

    this.saveMerges = function() {
        fh.saveJsonFile(service.mergeDataPath, exportMergeData());
    };

    this.loadMerges = function() {
        let profileName = settingsService.currentProfile;
        service.mergeDataPath = `profiles/${profileName}/merges.json`;
        let merges = fh.loadJsonFile(service.mergeDataPath) || [];
        service.merges = merges.map(importMergeData);
        service.saveMerges();
    };

    this.saveMergeData = function(merge) {
        let path = `${merge.dataPath}\\merge - ${merge.name}`;
        fh.jetpack.dir(path);
        fh.saveJsonFile(`${path}\\merge.json`, exportMerge(merge));
        fh.saveJsonFile(`${path}\\map.json`, merge.fidMap || {});
        fh.saveJsonFile(`${path}\\fidCache.json`, getFidCache(merge), true);
    };

    this.getMergeDataPath = function(merge) {
        return `${getMergePath()}\\${merge.name}`;
    };
});
