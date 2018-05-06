ngapp.service('interApiService', function() {
    let service = this,
        apis = {};

    this.getApi = function(key) {
        if (!apis.hasOwnProperty(key)) apis[key] = {};
        return apis[key];
    };

    this.publish = function(target, api) {
        if (target.constructor !== Array)
            return Object.assign(service.getApi(target), api);
        target.forEach(t => service.publish(t, api));
    };
});