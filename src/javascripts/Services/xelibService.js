ngapp.service('xelibService', function() {
    const globalsToPrint = ['ProgramPath', 'Version', 'GameName', 'DataPath',
        'AppDataPath', 'MyGamesPath', 'GameIniPath'];

    let service = this;

    this.getExceptionInformation = function() {
        try {
            logger.info(xelib.GetMessages());
            logger.error(xelib.GetExceptionMessage());
        } catch (e) {
            logger.error('Failed to get exception information: ' + e.stacktrace);
        }
    };

    this.printGlobals = function() {
        try {
            globalsToPrint.forEach(global => {
                logger.info(`${global}: ${xelib.GetGlobal(global)}`);
            });
        } catch (e) {
            logger.error(e.stacktrace);
            service.getExceptionInformation();
        }
    };

    this.startSession = function(profile) {
        logger.info(`User selected profile: ${profile.name}`);
        let gameMode = xelib.gameModes[profile.gameMode];
        logger.info(`Using game mode: ${gameMode}`);
        xelib.SetGamePath(profile.gamePath);
        xelib.SetLanguage(profile.language);
        xelib.SetGameMode(profile.gameMode);
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
