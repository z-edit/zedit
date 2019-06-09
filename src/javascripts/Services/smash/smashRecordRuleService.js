ngapp.service('smashRecordRuleService', function() {
    let service = this;

    let skipElementExpr = /(?:unknown|unused)/i,
        veryLargeRecords = ['NAVI', 'NAVM', 'RACE'],
        recordsMergedAtRuntime = ['DOBJ', 'LCTN', 'IDLE'],
        entityTypes = [xelib.stUnsortedArray, xelib.stUnsortedStructArray],
        deletionsTypes = [xelib.stSortedArray, xelib.stSortedStructArray];

    // PRIVATE
    let shouldSkipRecord = function(sig) {
        return veryLargeRecords.includes(sig) ||
            recordsMergedAtRuntime.includes(sig)
    };

    let shouldSkipElement = function(name) {
        return skipElementExpr.test(name);
    };

    let shouldSkip = function(element) {
        return element.type === xelib.stRecord ?
            shouldSkipRecord(element.signature) :
            shouldSkipElement(element.name);
    };

    let shouldSetEntity = function(element) {
        return entityTypes.includes(element.type);
    };

    let shouldSetDeletions = function(element) {
        return deletionsTypes.includes(element.type);
    };

    // PUBLIC API
    this.applyDefaultRules = function(element) {
        if (shouldSkip(element)) return;
        element.process = true;
        if (shouldSetEntity(element)) element.entity = true;
        if (shouldSetDeletions(element)) element.deletions = true;
        if (!element.elements) return;
        element.elements.forEach(service.applyDefaultRules);
    };

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
