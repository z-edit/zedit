ngapp.service('interApiService', function() {
    let registry = [];

    // PRIVATE
    let excludeApi = function(api, entry) {
        return entry.hasOwnProperty('except') && entry.except.includes(api) ||
            entry.hasOwnProperty('only') && !entry.only.includes(api);
    };

    // PUBLIC API
    this.getApi = function(apiKey) {
        let api = {};
        registry.forEach(entry => {
            if (excludeApi(apiKey, entry)) return;
            Object.assign(api, entry.api);
        });
        return api;
    };

    this.register = opts => registry.push(opts);
});
