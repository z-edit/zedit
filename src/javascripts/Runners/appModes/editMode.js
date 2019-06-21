ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'edit',
        name: 'zEdit',
        default: true,
        description: 'A development environment for creating and editing Bethesda mod files.',
        loader: 'selectLoadOrder'
    });
});
