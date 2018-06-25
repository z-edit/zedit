ngapp.service('scriptsCache', function(scriptHelpers) {
    let {fileReferenceExpr, getSourceFileName} = scriptHelpers;

    let dataPath, cachePath, archiveCache, scriptsCache, newScripts,
        service = this;

    let getPaths = function() {
        dataPath = xelib.GetGlobal('DataPath');
        cachePath = fh.jetpack.path('cache\\scripts');
        scriptsCachePath = `${cachePath}\\scriptsCache.json`;
        archiveCachePath = `${cachePath}\\archiveCache.json`;
    };

    let loadCache = function() {
        if (scriptsCache && archiveCache) return;
        scriptsCache = fh.loadJsonFile(scriptsCachePath) || [];
        archiveCache = fh.loadJsonFile(archiveCachePath) || [];
    };

    let saveCache = function() {
        fh.saveJsonFile(scriptsCache, scriptsCachePath);
        fh.saveJsonFile(archiveCache, archiveCachePath);
    };

    let hasScript = function(filename, hash) {
        return !!scriptCache.find(entry => {
            return entry.filename === filename && entry.hash === hash;
        });
    };

    let cacheArchives = function() {
        fh.getFiles(dataPath, {
            matching: '*.@(bsa|ba2)',
            recursive: false
        }).forEach(filePath => {
            // TODO
        });
    };

    let extractNewScripts = function() {
        // TODO
    };

    let findNewScripts = function() {
        newScripts = [];
        fh.getFiles(`${dataPath}\\scripts`, {
            matching: '*.pex',
            recursive: false
        }).forEach(filePath => {
            let filename = fh.jetpack.getFileName(filePath),
                hash = fh.getMd5Hash(filePath);
            if (hasScript(filename, hash)) return;
            newScripts.push({filename, hash});
        });
    };

    let getFileReferences = function(sourceCode) {
        let files = [];
        sourceCode.replace(fileReferenceExpr, (m, filename) => {
            if (!files.includes(filename)) files.push(filename);
        });
        return files;
    };

    let decompileNewScripts = function() {
        let scriptFileNames = newScripts.mapOnKey('filename');
        scriptHelpers.decompileScripts(scriptFileNames, cachePath);
        newScripts.forEach(script => {
            let sourceCode = service.loadSourceCode(script.filename);
            script.references = getFileReferences(sourceCode);
            scriptsCache.push(script);
        });
    };

    // PUBLIC API
    this.loadSourceCode = function(filename) {
        let sourceName = getSourceFileName(filename),
            sourcePath = `${cachePath}\\${sourceName}`;
        return fh.loadTextFile(sourcePath);
    };

    this.update = function() {
        getPaths();
        loadCache();
        cacheArchives();
        extractNewScripts();
        findNewScripts();
        decompileNewScripts();
        saveCache();
        return scriptsCache;
    };
});