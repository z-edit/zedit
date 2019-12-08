ngapp.service('extensionRegistry', function($http) {
    let domainUrl = 'https://raw.githubusercontent.com',
        baseUrl = `${domainUrl}/z-edit/zedit-registry/master`;

    let retrieveJsonResource = function(filename) {
        return $http.get(`${baseUrl}/${filename}`).then(response => {
            return response.data;
        });
    };

    this.retrieveModules = function() {
        return retrieveJsonResource('modules.json');
    };

    this.retrieveThemes = function() {
        return retrieveJsonResource('themes.json');
    };
});
