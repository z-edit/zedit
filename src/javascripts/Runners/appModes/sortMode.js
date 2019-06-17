ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'sort',
        name: 'zSort',
        description: '',
        loader: 'storeLoadOrder'
    });
});
