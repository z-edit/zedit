ngapp.service('xelibService', function() {
    let service = this;

    this.getExceptionInformation = function() {
        try {
            console.log(xelib.GetMessages());
            console.log(xelib.GetExceptionMessage());
        } catch (e) {
            console.log("Failed to get exception information: " + e);
        }
    };

    this.printGlobals = function() {
        try {
            console.log(xelib.GetGlobals());
        } catch (e) {
            console.log(e);
            service.getExceptionInformation();
        }
    };

    this.startSession = function(profile) {
        console.log(`Setting game mode to: ${profile.gameMode}`);
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
