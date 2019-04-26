ngapp.service('pluginDiffCacheService', function($rootScope, recordChangeService, progressLogger) {
    let {WithEachHandle, GetRecords, IsOverride, Name,
            WithHandle, GetPreviousOverride, GetElementFile} = xelib,
        {getRecordChanges} = recordChangeService,
        {log, progress} = progressLogger;

    let cache = {};

    // private
    let getFileHash = function(filename) {
        let plugin = $rootScope.loadOrder.findByKey('filename', filename);
        if (!plugin) throw new Error(`Could not find plugin information for ${filename}`);
        return plugin.hash;
    };

    let getCacheFilePath = function(pluginFileName, hash) {
        let filename = `${pluginFileName}-${hash}.json`;
        return fh.path('cache', 'pluginDiffs', filename);
    };

    let getElementFileName = function(record) {
        return WithHandle(GetElementFile(record), file => {
            return Name(file);
        });
    };

    let buildCache = function(file, filename, filePath) {
        let cache = {};
        log(`Getting changes in ${filename}`);
        WithEachHandle(GetRecords(file, true), rec => {
            if (!IsOverride(rec)) return;
            WithHandle(GetPreviousOverride(rec, file), masterRec => {
                let masterName = getElementFileName(masterRec);
                if (!cache.hasOwnProperty(masterName))
                    cache[masterName] = [];
                cache[masterName].push(getRecordChanges(masterRec, rec));
            });
        });
        fh.saveJsonFile(filePath, cache);
        return cache;
    };

    // public
    this.updateCache = function() {
        progress('Updating plugin diff cache');
        xelib.WithEachHandle(xelib.GetElements(), file => {
            let filename = xelib.Name(file),
                hash = getFileHash(filename),
                filePath = getCacheFilePath(filename, hash);
            cache[filename] = fh.loadJsonFile(filePath) ||
                buildCache(file, filename, filePath);
        });
    };
});