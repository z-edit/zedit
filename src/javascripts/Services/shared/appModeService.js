ngapp.service('appModeService', function($rootScope, $state) {
    this.applicationModes = ['edit', 'clean', 'merge'];

    this.setAppMode = function() {
        $state.go(`base.${$rootScope.appMode}`);
    };
});
