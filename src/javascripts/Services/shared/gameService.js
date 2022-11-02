ngapp.service('gameService', function() {
    let service = this,
        {plugins, archives} = fh.loadResource('app/bethesdaFiles.json'),
        appName, dataPath, appDataPath;

    let includesIgnoreCase = function(a, str) {
        str = str.toLowerCase();
        return a.contains(f => f.toLowerCase() === str);
    };

    // PUBLIC API
    this.isBethesdaPlugin = function(filename) {
        return includesIgnoreCase(plugins[service.appName], filename);
    };

    this.isBethesdaArchive = function(filename) {
        return includesIgnoreCase(archives[service.appName], filename);
    };

    this.getGame = function(gameMode) {
        return xelib.games.findByKey('mode', gameMode);
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
