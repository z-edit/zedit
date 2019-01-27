ngapp.service('mergeIntegrationService', function(settingsService, modManagerService, progressLogger, gameService) {
    let service = this;

    const oldFormatGames = ['TES5', 'TES4', 'FO3', 'FNV'];

    let runIntegration = function(key, modManager, merge) {
        let fn = (modManager && modManager[key]) || service[key];
        fn && fn(merge, settingsService.settings);
    };

    let pluginNotInMerge = function(merge, newFormat) {
        let prefix = newFormat ? '*' : '';
        let pluginFilenames = merge.plugins.map(obj => {
            return prefix + obj.filename.toLowerCase();
        });
        return line => {
            line = line.toLowerCase();
            return !pluginFilenames.find(filename => line === filename);
        };
    };

    let disablePluginsInMerge = function(merge) {
        let notInMerge = pluginNotInMerge(merge, true);
        return line => {
            if (notInMerge(line)) return line;
            progressLogger.log(`Disabling plugin: ${line.slice(1)}`);
            return line.replace(/^\*/, '');
        };
    };

    let getNewPluginsText = function(merge, pluginsText) {
        let pluginLines = pluginsText.split('\r\n'),
            appName = gameService.appName,
            usingOldFormat = oldFormatGames.includes(appName);
        let newPluginLines = usingOldFormat ?
            pluginLines.filter(pluginNotInMerge(merge)) :
            pluginLines.map(disablePluginsInMerge(merge));
        return newPluginLines.join('\r\n');
    };

    this.disablePlugins = function(merge) {
        progressLogger.log('Disabling merged plugins in plugins.txt');
        let pluginsPath = fh.path(gameService.appDataPath, 'plugins.txt'),
            pluginsText = fh.loadTextFile(pluginsPath),
            newText = getNewPluginsText(merge, pluginsText);
        fh.saveTextFile(pluginsPath, newText);
    };

    this.runIntegrations = function(merge) {
        let {mergeIntegrations, modManager} = settingsService.settings;
        modManager = modManagerService.getModManager(modManager);
        Object.keys(mergeIntegrations).forEach(key => {
            if (!mergeIntegrations[key]) return;
            runIntegration(key, modManager, merge);
        });
    };

    this.sortModFolders = function(folders) {
        let {modManager} = settingsService.settings;
        modManager = modManagerService.getModManager(modManager);
        if (!modManager || !modManager.getModsList) return folders;
        let sortedFolders = [];
        modManager.getModList().forEach(modName => {
            modName = modName.slice(1);
            let folder = folders.find(folder => {
                return fh.getFileName(folder) === modName;
            });
            if (folder && !sortedFolders.includes(folder))
                sortedFolders.push(folder);
        });
    };
});
