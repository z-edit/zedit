ngapp.service('pluginInfoService', function() {
    let bethesdaFiles = fh.loadResource('app/bethesdaFiles.json'),
        appName;

    let getAppName = function() {
        appName = xelib.GetGlobal('AppName')
    };

    // PUBLIC API
    this.isBethesdaFile = function(filename) {
        if (!appName) getAppName();
        return bethesdaFiles[appName].includes(filename);
    };
});
