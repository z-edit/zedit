ngapp.run(function(appModeService) {
    appModeService.addAppMode({
        id: 'clean',
        name: 'zClean',
        description: '',
        loader: 'selectLoadOrder',
        confirm: function() {
            return confirm(`The zClean application mode is still being developed.  Cleaning plugins may lead to CTDs.  Backups of any plugins cleaned with zClean will be saved to the zEdit Backups folder in your game's data directory.  Are you sure you want to proceed?`);
        }
    });
});
