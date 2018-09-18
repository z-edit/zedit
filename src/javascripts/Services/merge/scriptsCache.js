ngapp.service('scriptsCache', function(pexService, bsaHelpers, progressLogger, gameService) {
    let {log} = progressLogger;

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
        log(`Loading scripts cache from ${scriptsCachePath}`);
        scriptsCache = fh.loadJsonFile(scriptsCachePath) || [];
        log(`Loading archive cache from ${archiveCachePath}`);
        archiveCache = fh.loadJsonFile(archiveCachePath) || [];
    };

    let saveCache = function() {
        log('Saving scripts cache');
        fh.saveJsonFile(scriptsCachePath, scriptsCache);
        log('Saving archive cache');
        fh.saveJsonFile(archiveCachePath, archiveCache);
    };

    let getScriptEntry = function(filename, hash) {
        return scriptsCache.find(entry => {
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
        log(`Caching script ${filePath}, file refs: [${fileRefs}]`, true);
        scriptsCache.push(bsa ?
            { bsa, filename, hash, fileRefs } :
            { filename, hash, fileRefs });
    };

    let cacheArchiveScripts = function(filePath) {
        let bsa = fh.getFileName(filePath),
            scriptPaths = bsaHelpers.find(filePath, 'scripts\\*.pex');
        log(`Caching ${scriptPaths.length} scripts`);
        scriptPaths.forEach(scriptPath => {
            let outputPath = bsaHelpers.extractFile(bsa, scriptPath);
            cacheScript(outputPath, bsa);
        });
    };

    let cacheArchives = function() {
        log(`Caching archives`);
        fh.getFiles(dataPath, {
            matching: '*.@(bsa|ba2)',
            recursive: false
        }).forEach(filePath => {
            let filename = fh.getFileName(filePath);
            if (gameService.isBethesdaArchive(filename)) return;
            let hash = fh.getMd5Hash(filePath);
            if (getArchiveEntry(filename, hash)) return;
            log(`Caching scripts in archive ${filePath}`);
            cacheArchiveScripts(filePath);
            archiveCache.push({ filename, hash });
        });
    };

    let cacheScripts = function() {
        log(`Caching loose scripts`);
        fh.getFiles(`${dataPath}\\scripts`, {
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
