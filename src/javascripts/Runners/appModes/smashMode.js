ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'smash',
        name: 'zSmash',
        hidden: true,
        description: 'A tool for resolving record conflicts between plugin files.',
        loader: 'storeLoadOrder'
    });
});
