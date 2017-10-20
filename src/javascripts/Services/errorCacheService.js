ngapp.service('errorCacheService', function(pluginErrorService) {
    let buildErrors = function(plugin, errors) {
        return errors.map(function(error) {
            let file = xelib.GetElement(plugin._id, xelib.IntToHex(error.f));
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
        pluginErrorService.getErrorMessages(errors);
        plugin.errors = errors;
        plugin.status = `Found ${plugin.errors.length} cached errors`;
        plugin.checking = false;
        plugin.checked = true;
        plugin.skip = true;
    };

    this.loadErrorCache = function(plugin) {
        let filePath = `cache\\${plugin.filename}-${plugin.hash}.json`;
        if (fh.appDir.exists(filePath)) {
            let cachedErrors = fh.loadJsonFile(filePath) || {},
                errors = buildErrors(plugin, cachedErrors);
            setCachedErrors(plugin, errors);
        }
    };
});

ngapp.run(function(settingsService) {
    settingsService.registerSettings({
        label: 'Error Caching',
        appModes: ['clean'],
        templateUrl: 'partials/settings/errorCaching.html',
        controller: 'errorCachingController',
        defaultSettings: {
            cacheErrors: true
        }
    });
});
