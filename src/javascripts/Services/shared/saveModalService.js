ngapp.service('saveModalService', function(errorService) {
    this.buildFunctions = function(scope) {
        scope.setMessage = function(message, detailedMessage = '') {
            scope.$applyAsync(() => {
                if (message) scope.message = message;
                scope.detailedMessage = detailedMessage;
            });
        };

        scope.setProgress = function(message, index) {
            scope.detailedMessage = `${message} (${index}/${scope.total})`;
        };

        scope.savePlugins = function() {
            scope.setMessage('Saving plugins');
            scope.pluginsToSave.forEach((plugin, index) => {
                scope.setProgress(plugin.filename, index);
                errorService.try(() => xelib.SaveFile(plugin.handle));
            });
        };

        scope.finalize = function() {
            scope.setMessage('Deleting temporary files');
            fh.jetpack.remove('temp');
            scope.setMessage('Finalizing xEditLib');
            xelib.Finalize();
            scope.$emit('terminate');
        };

        scope.getActivePlugins = function() {
            return scope.pluginsToProcess.filterOnKey('active');
        };
    };
});