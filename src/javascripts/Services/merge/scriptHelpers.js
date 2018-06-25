ngapp.service('scriptHelpers', function(settingsService) {
    let service = this;

    this.fileReferenceExpr = /Game\.GetFormFromFile\s*\([^,]+,\s*"([^"]+)"\s*\)|Game\.GetModByName\s*\(\s*"([^"]+)"\s*\)/gi;

    this.compileScript = function(sourcePath, dstPath) {
        // TODO
    };

    this.decompileScript = function(scriptPath, dstPath) {
        // TODO
    };

    this.decompileScripts = function(scriptPaths, dstPath) {
        // TODO
    };

    this.getSourceFileName = function(scriptPath) {
        return `${fh.getFileBase(scriptPath)}.psc`;
    };

    this.getScriptSource = function(scriptPath) {
        let scriptsFolder = fh.getDirectory(scriptPath),
            sourceFileName = service.getSourceFileName(scriptPath),
            sourcePath = `${scriptsFolder}\\source\\${sourceFileName}`;
        if (fh.jetpack.exists(sourcePath) === 'file') return sourcePath;
        return decompileScript(scriptPath);
    };
});