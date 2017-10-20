ngapp.service('errorCacheService', function(errorMessageService) {
    let errorCache;

    // PRIVATE HELPER FUNCTIONS
    let buildErrors = function(plugin, errors) {
        return errors.map(function(error) {
            let file = xelib.GetElement(plugin._id, xelib.Hex(error.f));
            let x = {
                handle: file,
                group: error.g,
                form_id: error.f,
                name: xelib.LongName(file)
            };
            x.data = error.hasOwnProperty('d') ? error.d : '';
            x.path = error.hasOwnProperty('p') ? error.p : '';
            return x;
        });
    };

    let setCachedErrors = function(plugin, errors) {
        errorMessageService.getErrorMessages(errors);
        plugin.errors = errors;
        plugin.status = `Found ${plugin.errors.length} cached errors`;
        plugin.checking = false;
        plugin.checked = true;
        plugin.skip = true;
    };

    let buildFileEntry = function(filename, results) {
        let filePath = 'cache\\' + filename,
            cachedErrors = fh.loadJsonFile(filePath, {}),
            modified = fh.getDateModified(filePath);
        return {
            hash: results[2],
            error_count: cachedErrors.length,
            modified: modified
        }
    };

    let addCacheEntry = function(filename) {
        let fileRegex = /(.+\.es[p|m])\-([a-zA-Z0-9]{32})\.json/,
            results = fileRegex.exec(filename);
        if (!results) return;
        let entry = errorCache.find(function(entry) {
            return entry.filename === results[1];
        });
        let file = buildFileEntry(filename, results);
        if (!entry) {
            errorCache.push({
                filename: results[1],
                files: [file]
            });
        } else {
            entry.files.push(file);
        }
    };

    let loadErrorCache = function() {
        errorCache = [];
        fh.appDir.find('cache', {
            matching: '*.json',
            files: true,
            directories: false
        }).forEach(function(path) {
            try {
                addCacheEntry(fh.getFileName(path));
            } catch(x) {
                console.log('Error adding error cache entry: ', x);
            }
        });
    };

    let sanitizeErrors = function(errors) {
        return errors.map(function(error) {
            let x = {
                g: error.group,
                f: error.form_id
            };
            if (error.hasOwnProperty('data')) x.d = error.data;
            if (error.path !== '') x.p = error.path;
            return x;
        });
    };

    // PUBLIC API
    this.loadPluginErrors = function(plugin) {
        let filePath = `cache\\${plugin.filename}-${plugin.hash}.json`;
        if (fh.appDir.exists(filePath)) {
            let cachedErrors = fh.loadJsonFile(filePath) || {},
                errors = buildErrors(plugin, cachedErrors);
            setCachedErrors(plugin, errors);
            return true;
        }
    };

    this.getCache = function(forceReload) {
        if (forceReload || !errorCache) loadErrorCache();
        return errorCache;
    };

    this.createCache = function(plugin) {
        return {
            filename: plugin.filename,
            hash: plugin.hash,
            errors: plugin.errors
        }
    };

    this.saveCache = function(cache) {
        cache.forEach(function(entry) {
            let filename = `cache\\${entry.filename}-${entry.hash}.json`;
            fh.saveJsonFile(filename, sanitizeErrors(entry.errors), true);
        });
    };
});
