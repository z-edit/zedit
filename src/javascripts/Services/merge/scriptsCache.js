ngapp.service('scriptsCache', function(pexService, bsaHelpers) {
    let {loadScript, getFileRefs} = pexService,
        dataPath, cachePath, scriptsCachePath, archiveCachePath,
        archiveCache, scriptsCache, newScripts;

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

    let getArchiveScriptData = function(filePath) {
        let bsaFileName = fh.getFileName(filePath),
            scriptPaths = bsaHelpers.find(filePath, 'scripts\\*.pex');
        return scriptPaths.map(scriptPath => {
            let outputPath = bsaHelpers.extractFile(bsaFileName, scriptPath),
                script = loadScript(outputPath);
            return { scriptPath, data: getFileRefs(script) };
        });
    };

    let cacheArchives = function() {
        fh.getFiles(dataPath, {
            matching: '*.@(bsa|ba2)',
            recursive: false
        }).forEach(filePath => {
            let filename = fh.getFileName(filePath),
                hash = fh.getMd5Hash(filePath),
                cacheEntry = archiveCache.find(entry => {
                    return entry.filename === filename && entry.hash === hash;
                });
            if (!cacheEntry) {
                archiveCache.push({
                    filename, hash,
                    scripts: getArchiveScriptData(filePath)
                });
            }
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

    let processNewScripts = function() {
        let scriptFileNames = newScripts.mapOnKey('filename');
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
        processNewScripts();
        saveCache();
        return scriptsCache;
    };
});
