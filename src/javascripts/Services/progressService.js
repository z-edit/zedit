ngapp.service('progressService', function($q) {
    let closed;

    // helper functions
    let hideFunctions = function() {
        try {
            window.alert = () => {};
            window.confirm = () => {};
        } catch(x) {}
    };

    let restoreFunctions = function() {
        try {
            window.alert = window.Constructor.prototype.alert;
            window.confirm = window.Constructor.prototype.confirm;
        } catch(x) {}
    };

    // api functions
    this.showProgress = function(progress) {
        closed = $q.defer();
        hideFunctions();
        ipcRenderer.send('show-progress', progress);
    };

    this.hideProgress = function() {
        ipcRenderer.send('hide-progress');
        restoreFunctions();
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
