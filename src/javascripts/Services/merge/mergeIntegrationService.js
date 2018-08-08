ngapp.service('mergeIntegrationService', function(settingsService, modManagerService) {
    let service = this;

    let runIntegration = function(key, modManager, merge) {
        let fn = (modManager && modManager[key]) || service[key];
        fn && fn(merge);
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
            return line.replace(/^\*/, '');
        };
    };

    let getNewPluginsText = function(merge, pluginsText) {
        let pluginLines = pluginsText.split('\r\n'),
            gameAppName = xelib.GetGlobal('AppName'),
            usingOldFormat = oldFormatGames.includes(gameAppName);
        let newPluginLines = usingOldFormat ?
            pluginLines.filter(pluginNotInMerge(merge)) :
            pluginLines.map(disablePluginsInMerge(merge));
        return newPluginLines.join('\r\n');
    };

    this.disablePlugins = function(merge) {
        let appDataPath = xelib.GetGlobal('AppDataPath'),
            pluginsPath = appDataPath + 'plugins.txt',
            pluginsText = fh.loadTextFile(pluginsPath),
            newText = getNewPluginsText(merge, pluginsText);
        fh.saveTextFile(pluginsPath, newText);
    };

    this.runIntegrations = function(merge) {
        let {mergeIntegrations, modManagerName} = settingsService.settings,
            modManager = modManagerService.getModManager(modManagerName);
        mergeIntegrations.keys().forEach(key => {
            if (!mergeIntegrations[key]) return;
            runIntegration(key, modManager, merge);
        });
    };
});
