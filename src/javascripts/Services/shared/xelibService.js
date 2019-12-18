ngapp.service('xelibService', function() {
    const pathsToPrint = ['DataPath', 'AppDataPath', 'MyGamesPath', 'GameIniPath'];

    let service = this;

    let {GetGlobal, GetMessages, GetExceptionMessage, SetGamePath,
        SetLanguage, SetGameMode, ExchangeReferences, GetFormID,
        GetHexFormID, GetLinksTo, GetElementFile, Name, gameModes} = xelib;

    let printPaths = function() {
        try {
            pathsToPrint.forEach(pathName => {
                let path = GetGlobal(pathName),
                    method = fh.jetpack.exists(path) ? 'info' : 'warn';
                logger[method](`${pathName}: ${path}`);
            });
        } catch (e) {
            logger.error(e.stack);
            service.getExceptionInformation();
        }
    };

    this.getExceptionInformation = function() {
        try {
            logger.info(GetMessages());
            logger.error(GetExceptionMessage());
        } catch (e) {
            logger.error('Failed to get exception information: ' + e.stack);
        }
    };

    this.startSession = function(profile) {
        logger.info(`User selected profile: ${profile.name}`);
        logger.info(`Using game mode: ${gameModes[profile.gameMode]}`);
        let gamePath = profile.gamePath;
        if (!gamePath.endsWith('\\')) gamePath += '\\';
        SetGamePath(gamePath);
        SetLanguage(profile.language);
        SetGameMode(profile.gameMode);
        printPaths();
    };

    let getFormIds = function(records) {
        return records.map(record => GetFormID(record));
    };

    this.fixReferences = function(oldRecords, newRecords) {
        let oldFormIds = getFormIds(oldRecords),
            newFormIds = getFormIds(newRecords);
        newRecords.forEach(newRecord => {
            oldFormIds.forEach((oldFormId, index) => {
                let newFormId = newFormIds[index];
                ExchangeReferences(newRecord, oldFormId, newFormId);
            })
        });
    };

    let getLocalFormID = function(ref) {
        if (!ref) return '000000';
        return GetHexFormID(ref, false, true);
    };

    this.getReferenceValue = function(element) {
        let ref = GetLinksTo(element),
            file = GetElementFile(ref || element);
        return `{${Name(file)}:${getLocalFormID(ref)}}`;
    };
});
