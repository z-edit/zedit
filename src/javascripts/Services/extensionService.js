ngapp.service('extensionService', function() {
    let tabs = [
        'Installed Modules',
        'Installed Themes',
        'Browse Modules',
        'Browse Themes'
    ];

    this.getTabs = function() {
        return tabs.map(function(tab) {
            let tabVarName = tab.toCamelCase();
            return {
                label: tab,
                templateUrl: `partials/manageExtensions/${tabVarName}.html`,
                controller: `${tabVarName}Controller`
            };
        });
    };


});
