ngapp.service('extensionRegistry', function($http) {
    let domainUrl = 'https://raw.githubusercontent.com',
        baseUrl = `${domainUrl}/z-edit/zedit-registry/master`,
        resources = {};

    let retrieveResource = function(filename) {
        return $http.get(`${baseUrl}/${filename}`).then(response => {
            return response.data;
        });
    };

    let getResource = function(filename) {
        if (!resources.hasOwnProperty(filename))
            resources[filename] = retrieveResource(filename);
        return resources[filename];
    };

    this.retrieveModules = function() {
        return getResource('modules.json');
    };

    this.retrieveThemes = function() {
        return getResource('themes.json');
    };
});
