ngapp.service('smashRecordRuleService', function() {
    let service = this;

    // PUBLIC API
    this.addRecord = function(records, sig) {
        if (records.hasOwnProperty(sig)) return;
        xelib.WithHandle(xelib.GetRecordDef(sig), def => {
            let recordEntry = xelib.DefToObject(def);
            recordEntry.groups = [];
            records[sig] = recordEntry;
        });
    };

    this.addRecordsFromFile = function(records, filename) {
        xelib.WithHandle(xelib.FileByName(filename), file => {
            xelib.WithEachHandle(xelib.GetRecords(file, '', true), rec => {
                if (!xelib.IsOverride(rec)) return;
                let sig = xelib.Signature(rec);
                service.addRecord(records, sig);
            });
        });
    };

    this.addAllRecords = function(records) {
        let map = xelib.GetSignatureNameMap();
        Object.keys(map).sort().forEach(sig => {
            service.addRecord(records, sig);
        });
    };

    this.pruneRecords = function(records) {
        Object.keys(records).forEach(key => {
            if (records[key].process) return;
            delete records[key];
        });
    };
});
