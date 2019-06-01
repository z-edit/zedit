ngapp.run(function(contextMenuService, smashRecordRuleService) {
    let { addContextMenu, divider } = contextMenuService,
        { addRecord, addRecordsFromFile,
          addAllRecords, pruneRecords } = smashRecordRuleService;

    let getAddRecordItems = function(scope) {
        let records = xelib.GetSignatureNameMap();
        return Object.keys(records).filter(sig => {
            return !scope.treeHasRecord(sig);
        }).sort().map(sig => ({
            label: `[${sig}] ${records[sig]}`,
            callback: () => {
                addRecord(scope.records, sig);
                scope.reload();
            }
        }));
    };

    let getFileItems = function(scope) {
        return xelib.GetLoadedFileNames().map(filename => ({
            label: filename,
            callback: () => {
                addRecordsFromFile(scope.records, filename);
                scope.reload();
            }
        }));
    };

    let nodesSelected = scope => scope.selectedNodes.length > 0;

    let getGroup = scope => scope.prevNode && scope.prevNode.data.group;

    addContextMenu('ruleTree', [
        {
            id: 'Add record',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Add record',
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
                    children: getFileItems(scope)
                });
            }
        },
        {
            id: 'Add all records',
            visible: () => true,
            build: (scope, items) => {
                items.push({
                    label: 'Add all records',
                    callback: () => {
                        addAllRecords(scope.records);
                        scope.reload();
                    }
                });
            }
        },
        {
            id: 'Remove records',
            visible: scope => scope.recordsSelected(),
            build: (scope, items) => {
                let multiple = scope.selectedNodes.length > 0;
                items.push({
                    label: `Remove record${multiple ? 's' : ''}`,
                    callback: scope.removeRecords
                });
            }
        },
        {
            id: 'Prune records',
            visible: () => {},
            build: (scope, items) => {
                items.push({
                    label: 'Prune records',
                    callback: () => {
                        pruneRecords(scope.records);
                        scope.reload();
                    }
                });
            }
        },
        divider(),
        {
            id: 'Toggle deletions',
            visible: nodesSelected,
            build: (scope, items) => {
                items.push({
                    label: 'Toggle deletions',
                    callback: scope.toggleDeletions
                });
            }
        },
        {
            id: 'Toggle entity',
            visible: nodesSelected,
            build: (scope, items) => {
                items.push({
                    label: 'Toggle entity',
                    callback: scope.toggleEntity
                });
            }
        },
        {
            id: 'Group',
            visible: scope => scope.elementsSelected(),
            build: (scope, items) => {
                let group = getGroup(scope);
                items.push({
                    label: `${group ? 'Edit' : 'Create'} group`,
                    callback: scope.createOrEditGroup
                });
            }
        },
        {
            id: 'Remove group',
            visible: getGroup,
            build: (scope, items) => {
                items.push({
                    label: 'Remove group',
                    callback: scope.removeGroup
                });
            }
        },
        divider(),
        {
            id: 'Increase priority',
            visible: nodesSelected,
            build: (scope, items) => {
                items.push({
                    label: 'Increase priority',
                    callback: scope.increasePriority
                });
            }
        },
        {
            id: 'Decrease priority',
            visible: nodesSelected,
            build: (scope, items) => {
                items.push({
                    label: 'Decrease priority',
                    callback: scope.decreasePriority
                });
            }
        },
        {
            id: 'Set priority',
            visible: nodesSelected,
            build: (scope, items) => {
                items.push({
                    label: 'Increase priority',
                    callback: scope.setPriority
                });
            }
        }
    ]);
});