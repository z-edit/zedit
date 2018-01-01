ngapp.service('appModeService', function($rootScope, $state) {
    let applicationModes = ['edit', 'clean', 'merge'],
        skipLoadModes = ['merge', 'smash'];

    this.getAppModes = function() {
        return applicationModes;
    };

    this.setAppMode = function() {
        $state.go(`base.${$rootScope.appMode}`);
    };

    this.skipLoad = function() {
        return skipLoadModes.includes($rootScope.appMode);
    };
});
