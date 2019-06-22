ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'merge',
        name: 'zMerge',
        description: 'A tool for combining plugin files and assets associated with them to free up load order slots.',
        loader: 'storeLoadOrder'
    });
});
