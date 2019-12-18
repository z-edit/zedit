ngapp.service('gameService', function($rootScope) {
    let service = this,
        {GetGlobal, games} = xelib,
        {plugins, archives} = fh.loadResource('app/bethesdaFiles.json'),
        appName, dataPath, appDataPath, game;

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

    this.isGameEsm = function(filename) {
        return filename === service.gameEsmFilename;
    };

    this.isGameEsmOrExe = function(filename) {
        return service.isGameEsm(filename) || filename.endsWith('.exe');
    };

    Object.defineProperty(this, 'dataPath', {
        get: function() {
            if (!dataPath) dataPath = GetGlobal('DataPath');
            return dataPath;
        }
    });

    Object.defineProperty(this, 'appName', {
        get: function() {
            if (!appName) appName = GetGlobal('AppName');
            return appName;
        }
    });

    Object.defineProperty(this, 'appDataPath', {
        get: function() {
            if (!appDataPath) appDataPath = GetGlobal('AppDataPath');
            return appDataPath;
        }
    });

    Object.defineProperty(this, 'currentGame', {
        get: function() {
            if (!game) game = games.findByKey('mode', $rootScope.profile.gameMode);
            return game;
        }
    });

    Object.defineProperty(this, 'gameEsmFilename', {
        get: function() {
            return `${service.currentGame.shortName}.esm`;
        }
    });
});
