ngapp.run(function($rootScope, appModeService) {
    appModeService.addLoader('selectLoadOrder', function(scope) {
        let {appMode} = $rootScope;
        scope.$emit('setTitle', `${appMode.name} - Selecting Load Order`);
        scope.$emit('openModal', 'loadOrder', {}, true);
    });
});
