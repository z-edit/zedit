ngapp.service('patchService', function(settingsService, objectUtils, gameService) {
    let service = this,
        patchExportKeys = ['name', 'filename', 'plugins', 'dateBuilt'],
        pluginExportKeys = ['filename', 'hash', 'dataFolder'];

    // private functions
    let getPatchPath = function() {
        let patchPath = settingsService.settings.patchPath;
        fh.jetpack.dir(patchPath);
        return patchPath;
    };

    let getNewPatchName = function() {
        let patchName = 'New Patch',
            counter = 1,
            patchPath = getPatchPath(),
            directories = fh.getDirectories(patchPath).map(fh.getFileName);
        while (directories.includes(patchName))
            patchName = `New Patch ${++counter}`;
        return patchName;
    };

    let exportPatch = function(patch) {
        let patchObj = objectUtils.rebuildObject(patch, patchExportKeys);
        patchObj.plugins = patch.plugins.map(function(plugin) {
            return objectUtils.rebuildObject(plugin, pluginExportKeys);
        });
        return patchObj;
    };

    let importPluginData = function(plugin) {
        plugin.hash = fh.getMd5Hash(gameService.dataPath + plugin.filename);
    };

    let importPatchData = function(patch) {
        let path = fh.path(getPatchPath(), patch.name, 'patch', 'patch.json'),
            oldPatch = fh.loadJsonFile(path);
        patch.oldPlugins = oldPatch && oldPatch.plugins;
        patch.plugins.forEach(importPluginData);
    };

    // public api
    this.newPatch = function() {
        let patchName = getNewPatchName();
        return initPatchData({
            name: patchName,
            filename: `${patchName}.esp`,
            patchType: 'Full load order patch',
            method: 'Master',
            plugins: [],
            addedPlugins: [],
            changedPlugins: [],
            removedPlugins: [],
            pluginExclusions: [],
            status: 'Ready to be built'
        });
    };

    this.savePatches = function() {
        let patchData = service.patches.map(exportPatch);
        fh.saveJsonFile(service.patchDataPath, patchData);
    };

    this.loadPatches = function() {
        if (service.patches) return;
        let profileName = settingsService.currentProfile;
        service.patchDataPath = `profiles/${profileName}/patches.json`;
        service.patches = fh.loadJsonFile(service.patchDataPath) || [];
        service.patches.forEach(importPatchData);
        service.savePatches();
    };

    this.savePatchData = function(patch) {
        let path = `${patch.dataPath}\\patch`;
        fh.jetpack.dir(path);
        fh.saveJsonFile(`${path}\\patch.json`, exportPatch(patch));
    };

    this.getPatchDataPath = function(patch) {
        return `${getPatchPath()}\\${patch.name}`;
    };
});