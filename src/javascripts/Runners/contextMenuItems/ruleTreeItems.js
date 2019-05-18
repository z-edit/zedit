ngapp.run(function(contextMenuService) {
    let { addContextMenu } = contextMenuService;

    let getAddRecordItems = function(scope) {
        let records = xelib.GetSignatureNameMap();
        return Object.keys(records).filter(sig => {
            return !scope.tree.hasOwnProperty(sig);
        }).map(sig => ({
            label: `[${sig}] ${records[sig]}`,
            callback: () => scope.addRecord(sig)
        }));
    };

    let getFileItems = function(scope) {
        return xelib.GetLoadedFileNames().map(filename => ({
            label: filename,
            callback: () => scope.addRecordsFromFile(filename)
        }));
    };

    let recordSelected = scope => Boolean(scope.selectedRecord);

    addContextMenu('ruleTree', [
        {
            id: 'Add record',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Add Record',
                    children: getAddRecordItems(scope)
                });
            }
        },
        {
            id: 'Add records from file',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Add records from file',
                    children: getFileItems()
                });
            }
        },
        {
            id: 'Add all records',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Add all records',
                    callback: scope.addAllRecords
                });
            }
        },
        {
            id: 'Remove record',
            visible: recordSelected,
            build: (scope, items) => {
                items.push({
                    label: 'Remove record',
                    callback: scope.removeRecord
                });
            }
        },
        {
            id: 'Prune records',
            visible: () => {},
            build: (scope, items) => {
                items.push({
                    label: 'Prune records',
                    callback: scope.pruneRecords
                });
            }
        },
    ]);
});