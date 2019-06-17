ngapp.run(function($rootScope, appModeService) {
    appModeService.addLoader('selectLoadOrder', function(scope) {
        let title = `${$rootScope.appMode} - Selecting Load Order`;
        scope.$emit('setTitle', title);
        scope.$emit('openModal', 'loadOrder', {}, true);
    });
});
