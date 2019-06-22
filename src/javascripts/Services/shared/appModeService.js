ngapp.service('appModeService', function($rootScope, $state) {
    let appModes = [];
    let loaders = {};

    // PUBLIC API
    this.getAppModes = function() {
        return appModes.filter(m => {
            return !m.hidden || env.show_hidden_appmodes;
        });
    };

    this.addAppMode = function(appMode) {
        appModes.push(appMode);
    };

    this.addLoader = function(name, loadFn) {
        loaders[name] = loadFn;
    };

    this.goToAppView = function() {
        $state.go(`base.${$rootScope.appMode}`);
    };

    this.selectAppMode = function(appMode) {
        if (appMode.confirm && !appMode.confirm()) return;
        $rootScope.appMode = appMode.name;
        return true;
    };

    this.runLoader = function(scope) {
        let appMode = appModes.findByKey('name', $rootScope.appMode);
        loaders[appMode.loader](scope);
    };
});
