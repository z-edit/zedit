ngapp.service('progressService', function($q) {
    let closed, originalFunctions;

    // helper functions
    let hideFunctions = function(...functionNames) {
        functionNames.forEach(name => {
            originalFunctions[name] = window[name];
            window[name] = () => {};
        });
    };

    let restoreFunctions = function(...functionNames) {
        functionNames.forEach(name => {
            if (!originalFunctions.hasOwnProperty(name)) return;
            window[name] = originalFunctions[name];
            delete originalFunctions[name];
        });
    };

    // api functions
    this.showProgress = function(progress) {
        closed = $q.defer();
        hideFunctions('alert', 'confirm');
        ipcRenderer.send('show-progress', progress);
    };

    this.hideProgress = function() {
        ipcRenderer.send('hide-progress');
        restoreFunctions('alert', 'confirm')
    };

    this.logMessage = function(message, level = 0) {
        ipcRenderer.send('log-message', [message, level]);
    };

    this.progressMessage = function(message) {
        ipcRenderer.send('progress-message', message);
    };

    this.addProgress = function(num) {
        ipcRenderer.send('add-progress', num);
    };

    this.progressTitle = function(title) {
        ipcRenderer.send('progress-title', title);
    };

    this.allowClose = function() {
        ipcRenderer.send('allow-close');
    };

    this.onProgressClosed = (callback) => closed.then(callback);

    ipcRenderer.on('progress-hidden', () => closed.resolve(true));
});

ngapp.run(function(interApiService, progressService) {
    interApiService.publish('zeditScripting', {
        LogMessage: progressService.logMessage,
        ProgressMessage: progressService.progressMessage,
        AddProgress: progressService.addProgress,
        ProgressTitle: progressService.progressTitle
    });
});