ngapp.service('progressService', function($q) {
    let closed;

    ipcRenderer.on('progress-hidden', () => closed.resolve(true));

    this.showProgress = function(progress) {
        closed = $q.defer();
        ipcRenderer.send('show-progress', progress);
    };

    this.hideProgress = function() {
        ipcRenderer.send('hide-progress');
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
});
