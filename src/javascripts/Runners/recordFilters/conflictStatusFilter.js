ngapp.run(function(recordFilterService) {
    let conflictKeys = Array.prototype.concat(
            xelib.conflictAll, xelib.conflictThis
        ),
        conflictProperties = conflictKeys.reduce((obj, key) => {
            obj[key] = true;
            return obj;
        }, {});

    recordFilterService.addFilter('Conflict Status', (path = '') => Object.Assign({
        type: 'Conflict Status',
        path: path,
        conflictAllOptions: xelib.conflictAll,
        conflictThisOptions: xelib.conflictThis,
        templateUrl: 'partials/filters/conflictStatus.html',
        exportKeys: ['path'].concat(conflictKeys),
        test: function(record) {
            let element;
            try {
                element = xelib.GetElement(record, path);
                let [ca, ct] = xelib.GetConflictData(0, element);
                return this[xelib.conflictAll[ca]] &&
                    this[xelib.conflictThis[ct]];
            } finally {
                if (element) xelib.Release(element);
            }
        }
    }, conflictProperties));
});