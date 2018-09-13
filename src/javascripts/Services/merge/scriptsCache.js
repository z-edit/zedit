ngapp.service('scriptsCache', function(pexService, bsaHelpers) {
    let dataPath, cachePath, scriptsCachePath, archiveCachePath,
        archiveCache, scriptsCache;

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

    let getScriptEntry = function(filename, hash) {
        return scriptCache.find(entry => {
            return entry.filename === filename && entry.hash === hash;
        });
    };

    let getArchiveEntry = function(filename, hash) {
        return archiveCache.find(entry => {
            return entry.filename === filename && entry.hash === hash;
        });
    };

    let cacheScript = function(filePath, bsa) {
        let filename = fh.getFileName(filePath),
            hash = fh.getMd5Hash(filePath);
        if (getScriptEntry(filename, hash)) return;
        let fileRefs = pexService.getFileRefs(filePath);
        scriptsCache.push(bsa ?
            { bsa, filename, hash, fileRefs } :
            { filename, hash, fileRefs });
    };

    let cacheArchiveScripts = function(filePath) {
        let bsa = fh.getFileName(filePath),
            scriptPaths = bsaHelpers.find(filePath, 'scripts\\*.pex');
        scriptPaths.forEach(scriptPath => {
            let outputPath = bsaHelpers.extractFile(bsa, scriptPath);
            cacheScript(outputPath, bsa);
        });
    };

    let cacheArchives = function() {
        fh.getFiles(dataPath, {
            matching: '*.@(bsa|ba2)',
            recursive: false
        }).forEach(filePath => {
            let filename = fh.getFileName(filePath),
                hash = fh.getMd5Hash(filePath);
            if (getArchiveEntry(filename, hash)) return;
            cacheArchiveScripts(filePath);
            archiveCache.push({ filename, hash });
        });
    };

    let cacheScripts = function() {
        return fh.getFiles(`${dataPath}\\scripts`, {
            matching: '*.pex',
            recursive: false
        }).forEach(filePath => cacheScript(filePath));
    };

    // PUBLIC API
    this.update = function() {
        getPaths();
        loadCache();
        cacheArchives();
        cacheScripts();
        saveCache();
        return scriptsCache;
    };
});
