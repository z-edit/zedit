ngapp.service('xelibService', function() {
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
            logger.log(xelib.GetGlobals());
        } catch (e) {
            logger.error(e.stacktrace);
            service.getExceptionInformation();
        }
    };

    this.startSession = function(profile) {
        logger.info(`Setting game mode to: ${profile.gameMode}`);
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
