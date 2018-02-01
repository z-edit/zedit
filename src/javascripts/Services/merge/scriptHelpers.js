ngapp.service('scriptHelpers', function(settingsService) {
    this.compileScript = function(sourcePath, dstPath) {
        // TODO
    };

    this.decompileScript = function(scriptPath, dstPath) {
        // TODO
    };

    this.getScriptSource = function(scriptPath) {
        let scriptsFolder = fh.getDirectory(scriptPath),
            sourceFileName = `${fh.getFileBase(scriptPath)}.psc`,
            sourcePath = `${scriptsFolder}\\source\\${sourceFileName}`;
        if (fh.jetpack.exists(sourcePath) === 'file') return sourcePath;
        return decompileScript(scriptPath);
    };
});