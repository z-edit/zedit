ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'edit',
        name: 'zEdit',
        description: '',
        loader: 'selectLoadOrder'
    });
});
