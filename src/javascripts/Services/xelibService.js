ngapp.service('xelibService', function() {
    const pathsToPrint = ['DataPath', 'AppDataPath', 'MyGamesPath', 'GameIniPath'];

    let service = this;

    let printPaths = function() {
        try {
            pathsToPrint.forEach(pathName => {
                let path = xelib.GetGlobal(pathName),
                    method = fh.jetpack.exists(path) ? 'info' : 'warn';
                logger[method](`${pathName}: ${path}`);
            });
        } catch (e) {
            logger.error(e.stacktrace);
            service.getExceptionInformation();
        }
    };

    this.getExceptionInformation = function() {
        try {
            logger.info(xelib.GetMessages());
            logger.error(xelib.GetExceptionMessage());
        } catch (e) {
            logger.error('Failed to get exception information: ' + e.stacktrace);
        }
    };

    this.startSession = function(profile) {
        logger.info(`User selected profile: ${profile.name}`);
        logger.info(`Using game mode: ${xelib.gameModes[profile.gameMode]}`);
        xelib.SetGamePath(profile.gamePath);
        xelib.SetLanguage(profile.language);
        xelib.SetGameMode(profile.gameMode);
        printPaths();
    };

    let getFormIds = function(records) {
        return records.map((record) => { return xelib.GetFormID(record) });
    };

    this.fixReferences = function(oldRecords, newRecords) {
        let oldFormIds = getFormIds(oldRecords),
            newFormIds = getFormIds(newRecords);
        newRecords.forEach(function(newRecord) {
            oldFormIds.forEach(function(oldFormId, index) {
                let newFormId = newFormIds[index];
                xelib.ExchangeReferences(newRecord, oldFormId, newFormId);
            })
        });
    };
});
