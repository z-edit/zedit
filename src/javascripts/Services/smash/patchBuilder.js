ngapp.service('patchBuilder', function(progressLogger, progressService, pluginDiffCacheService) {
    let {log, progress} = progressLogger;

    // PUBLIC API
    this.buildPatch = function(patch) {
        progressService.showProgress({
            determinate: true,
            title: 'Building Smashed Patch',
            message: 'Initializing...',
            logName: 'smash',
            current: 0,
            max: 1
        });
        pluginDiffCacheService.updateCache();
    };
});
