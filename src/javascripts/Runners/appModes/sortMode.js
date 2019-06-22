ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'sort',
        name: 'zSort',
        description: 'A tool for sorting plugin load order.',
        loader: 'storeLoadOrder'
    });
});
