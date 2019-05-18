ngapp.service('smashRecordRuleService', function() {
    let service = this;

    // PUBLIC API
    this.addRecord = function(tree, sig) {
        xelib.WithHandle(xelib.GetRecordDef(sig), def => {
            tree[sig] = xelib.DefToObject(def);
        });
    };

    this.addRecordsFromFile = function(tree, filename) {
        xelib.WithHandle(xelib.FileByName(filename), file => {
            xelib.WithEachHandle(xelib.GetRecords(file, '', true), rec => {
                if (!xelib.IsOverride(rec)) return;
                let sig = xelib.Signature(rec);
                if (tree.hasOwnProperty(sig)) return;
                service.addRecord(tree, sig);
            });
        });
    };

    this.addAllRecords = function(tree) {
        let map = xelib.GetSignatureNameMap();
        Object.keys(map).forEach(sig => {
            if (tree.hasOwnProperty(sig)) return;
            service.addRecord(tree, sig);
        });
    };

    this.pruneRecords = function(tree) {
        Object.keys(tree).forEach(key => {
            if (tree[key].process) return;
            delete tree[key];
        });
    };
});
