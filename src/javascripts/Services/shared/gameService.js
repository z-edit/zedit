ngapp.service('gameService', function() {
    let {plugins, archives} = fh.loadResource('app/bethesdaFiles.json'),
        appName, dataPath, appDataPath;

    let includesIgnoreCase = function(a, str) {
        str = str.toLowerCase();
        return a.find(f => f.toLowerCase() === str) !== undefined;
    };

    // PUBLIC API
    this.isBethesdaPlugin = function(filename) {
        return includesIgnoreCase(plugins[this.appName], filename);
    };

    this.isBethesdaArchive = function(filename) {
        if (!appName) getAppName();
        return includesIgnoreCase(archives[this.appName], filename);
    };

    Object.defineProperty(this, 'dataPath', {
        get: function() {
            if (!dataPath) dataPath = xelib.GetGlobal('DataPath');
            return dataPath;
        }
    });

    Object.defineProperty(this, 'appName', {
        get: function() {
            if (!appName) appName = xelib.GetGlobal('AppName');
            return appName;
        }
    });

    Object.defineProperty(this, 'appDataPath', {
        get: function() {
            if (!appDataPath) appDataPath = xelib.GetGlobal('AppDataPath');
            return appDataPath;
        }
    });
});
