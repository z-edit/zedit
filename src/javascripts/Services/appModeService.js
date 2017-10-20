ngapp.service('appModeService', function($rootScope, $state) {
    this.applicationModes = ['edit', 'clean'];

    this.setAppMode = function() {
        $state.go(`base.${$rootScope.appMode}`);
    };
});
