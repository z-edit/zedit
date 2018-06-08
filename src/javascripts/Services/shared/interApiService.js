ngapp.service('interApiService', function() {
    let registry = [];

    // PRIVATE
    let excludeApi = function(key, entry) {
        return entry.hasOwnProperty('except') && entry.except.includes(key) ||
            entry.hasOwnProperty('only') && !entry.only.includes(key);
    };

    // PUBLIC API
    this.getApi = function(key) {
        let api = {};
        registry.forEach(entry => {
            if (excludeApi(key, entry)) return;
            Object.assign(api, entry.api);
        });
        return api;
    };

    this.register = opts => registry.push(opts);
});
