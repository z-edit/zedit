ngapp.service('pluginDiffCacheService', function($rootScope, recordChangeService, progressLogger, progressService, gameService) {
    let {WithEachHandle, GetRecords, IsOverride, Name,
            WithHandle, GetMasterRecord, GetElementFile} = xelib,
        {getRecordChanges} = recordChangeService,
        {log, progress} = progressLogger,
        {progressMessage} = progressService;

    let cache = {},
        oldCache = {},
        n, start;

    // private
    let getFileHash = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        if (!plugin) throw new Error(`Could not find plugin information for ${filename}`);
        return plugin.hash;
    };

    let getCacheFilePath = function(pluginFileName, hash) {
        return fh.jetpack.dir('cache/pluginDiffs')
            .path(`${pluginFileName}-${hash}.json`);
    };

    let getElementFileName = function(record) {
        return WithHandle(GetElementFile(record), file => {
            return Name(file);
        });
    };

    let rateMessage = function(n, start) {
        let time = new Date() - start,
            rate = (n / time) * 1000 * 60,
            rateStr = `${rate.toFixed(0)} overrides/min`;
        progressMessage(`Updating plugin diff cache (${rateStr})`);
    };

    let buildCache = function(file, filename, filePath) {
        let cache = {};
        log(`Getting changes in ${filename}`);
        WithEachHandle(GetRecords(file, '', true), rec => {
            if (!IsOverride(rec)) return;
            if (n++ % 50 === 49) rateMessage(n, start);
            WithHandle(GetMasterRecord(rec, file), masterRec => {
                let masterName = getElementFileName(masterRec),
                    changes = getRecordChanges(masterRec, rec);
                if (!changes) return;
                if (!cache.hasOwnProperty(masterName))
                    cache[masterName] = [];
                cache[masterName].push(changes);
            });
        });
        fh.saveJsonFile(filePath, cache, true);
        return cache;
    };

    let loadCache = function(filename, filePath) {
        if (!fh.fileExists(filePath)) return;
        log(`Loading cached changes ${filePath}`);
        return fh.loadJsonFile(filePath);
    };

    // public
    this.updateCache = function() {
        progress('Updating plugin diff cache');
        n = 0;
        start = new Date();
        xelib.WithEachHandle(xelib.GetElements(), file => {
            let filename = xelib.Name(file);
            if (gameService.isGameEsmOrExe(filename)) return;
            let hash = getFileHash(filename),
                filePath = getCacheFilePath(filename, hash);
            cache[filename] = loadCache(filename, filePath) ||
                buildCache(file, filename, filePath);
        });
    };

    this.getOldCache = function(plugin) {
        let filePath = getCacheFilePath(plugin.filename, plugin.hash);
        if (!oldCache.hasOwnProperty(filePath))
            oldCache[filePath] = fh.loadJsonFile(filePath);
        return oldCache[filePath];
    };

    this.getCache = function(plugin) {
        return cache[plugin.filename];
    };
});
