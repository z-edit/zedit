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

    this.logMessage = function(msg, level) {
        ipcRenderer.send('log-message', [msg, level]);
    };

    this.progressMessage = function(msg) {
        ipcRenderer.send('progress-message', msg);
    };

    this.addProgress = function(num) {
        ipcRenderer.send('add-progress', num);
    };

    this.progressTitle = function(title) {
        ipcRenderer.send('progress-title', title);
    };

    this.onProgressClosed = (callback) => closed.then(callback);
});