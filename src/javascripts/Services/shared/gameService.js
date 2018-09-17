ngapp.service('gameService', function() {
    let bethesdaFiles = fh.loadResource('app/bethesdaFiles.json'),
        appName;

    let getAppName = function() {
        appName = xelib.GetGlobal('AppName')
    };

    // PUBLIC API
    this.isBethesdaPlugin = function(filename) {
        if (!appName) getAppName();
        return bethesdaFiles.plugins[appName].includes(filename);
    };

    this.isBethesdaArchive = function(filename) {
        if (!appName) getAppName();
        return bethesdaFiles.archives[appName].includes(filename);
    };
});
