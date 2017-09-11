ngapp.service('backgroundService', function($q) {
    let service = this,
        action;

    ipcRenderer.on('worker-callback', function(event, data) {
        if (!service.callbacks) return;
        let callback = service.callbacks[data.callbackName];
        callback && callback(...data.args);
    });

    ipcRenderer.on('worker-message', (event, message) => console.log(message));
    ipcRenderer.on('worker-done', (event, result) => action.resolve(result));
    ipcRenderer.on('worker-error', (event, e) => action.reject(e));

    // serializing like this means it won't be deserialized in the main process,
    // which is slightly faster. it also allows us to support passing background
    // workers isolated functions
    let serialize = function(obj) {
        return JSON.stringify(obj, function(key, value) {
            if (typeof(value) === 'function') return value.toString();
            return value;
        });
    };

    // TODO: Add support for function callbacks which use a promise-based system to call code and return the result (for use with blocking GUI operations)
    this.run = function(options) {
        action = $q.defer();
        service.callbacks = Object.assign({}, options.callbacks);
        options.callbacks = Object.keys(options.callbacks);
        ipcRenderer.send('run-worker', serialize(options));
        return action.promise;
    };
});