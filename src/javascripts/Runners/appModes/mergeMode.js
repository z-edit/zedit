ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'merge',
        name: 'zMerge',
        description: '',
        loader: 'storeLoadOrder'
    });
});
