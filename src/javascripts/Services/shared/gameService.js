ngapp.service('gameService', function() {
    let bethesdaFiles = fh.loadResource('app/bethesdaFiles.json'),
        appName;

    let getAppName = function() {
        appName = xelib.GetGlobal('AppName')
    };

    let includesIgnoreCase = function(a, str) {
        str = str.toLowerCase();
        return a.find(f => f.toLowerCase() === str) !== undefined;
    };

    // PUBLIC API
    this.isBethesdaPlugin = function(filename) {
        if (!appName) getAppName();
        return includesIgnoreCase(bethesdaFiles.plugins[appName], filename);
    };

    this.isBethesdaArchive = function(filename) {
        if (!appName) getAppName();
        return includesIgnoreCase(bethesdaFiles.archives[appName], filename);
    };
});
