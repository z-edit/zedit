ngapp.service('patchService', function($rootScope, settingsService, objectUtils) {
    let service = this,
        patchExportKeys = ['name', 'filename', 'baseRule', 'patchType',
            'method', 'pluginExclusions', 'pluginInclusions', 'dateBuilt'],
        pluginExportKeys = ['filename', 'hash'];

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

    let exportPatch = function(patch, exportPlugins = false) {
        let patchObj = objectUtils.rebuildObject(patch, patchExportKeys);
        if (!exportPlugins) return patchObj;
        patchObj.plugins = patch.plugins.map(function(plugin) {
            return objectUtils.rebuildObject(plugin, pluginExportKeys);
        });
        return patchObj;
    };

    let importPatchData = function(patch) {
        let path = fh.path(getPatchPath(), patch.name, 'patch', 'patch.json'),
            oldPatch = fh.loadJsonFile(path);
        patch.oldPlugins = oldPatch && oldPatch.plugins;
        service.updatePatchPlugins(patch);
    };

    let pluginInPatch = (patch, plugin) => {
        return patch.patchType === 'Full load order' ?
            !patch.pluginExclusions.includes(plugin.filename) :
            patch.pluginInclusions.includes(plugin.filename);
    };

    // public api
    this.newPatch = function() {
        let patchName = getNewPatchName();
        return service.updatePatchPlugins({
            name: patchName,
            filename: `${patchName}.esp`,
            patchType: 'Full load order',
            method: 'Master',
            pluginExclusions: [],
            baseRule: 'Default.json',
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
        fh.saveJsonFile(`${path}\\patch.json`, exportPatch(patch, true));
    };

    this.getPatchDataPath = function(patch) {
        return `${getPatchPath()}\\${patch.name}`;
    };

    this.updatePatchPlugins = function(patch) {
        patch.plugins = $rootScope.loadOrder
            .filter(plugin => pluginInPatch(patch, plugin))
            .map(plugin => ({
                filename: plugin.filename,
                hash: plugin.hash
            }));
        return patch;
    };
});
