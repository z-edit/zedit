ngapp.service('mergeService', function(settingsService, mergeDataService, objectUtils) {
    let service = this,
        mergeExportKeys = ['name', 'filename', 'method', 'useGameLoadOrder', 'loadOrder', 'archiveAction', 'handleFaceData', 'handleVoiceData', 'handleBillboards', 'handleScriptFragments', 'handleStringFiles', 'handleTranslations', 'handleIniFiles', 'copyGeneralAssets', 'dateBuilt'],
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
        plugin.hash = fh.getMd5Hash(plugin.dataFolder + plugin.filename);
    };

    let importMergeData = function(merge) {
        let oldMerge = fh.loadJsonFile(fh.path(
            getMergePath(),
            merge.name,
            `merge - ${merge.name}`,
            'merge.json'
        ));
        merge.method = !merge.method ? 'Clobber' :
            mergeMethodMap[merge.method] || merge.method;
        merge.oldPlugins = oldMerge && oldMerge.plugins;
        merge.plugins.forEach(importPluginData);
    };

    // public api
    this.newMerge = function() {
        let mergeName = getNewMergeName();
        return initMergeData({
            name: mergeName,
            filename: `${mergeName}.esp`,
            method: 'Clobber',
            plugins: [],
            loadOrder: [],
            status: 'Ready to be built',
            archiveAction: 'Merge',
            useGameLoadOrder: true,
            handleFaceData: true,
            handleVoiceData: true,
            handleBillboards: true,
            handleScriptFragments: true,
            handleStringFiles: true,
            handleTranslations: true,
            handleIniFiles: true,
            copyGeneralAssets: false
        });
    };

    this.saveMerges = function() {
        fh.saveJsonFile(service.mergeDataPath, exportMergeData());
    };

    this.loadMerges = function() {
        let profileName = settingsService.currentProfile;
        service.mergeDataPath = `profiles/${profileName}/merges.json`;
        service.merges = fh.loadJsonFile(service.mergeDataPath) || [];
        service.merges.forEach(importMergeData);
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
