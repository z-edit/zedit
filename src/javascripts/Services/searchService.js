ngapp.service('searchService', function(progressService) {
    let service = this;

    // PRIVATE
    let gettingRecordsMessage = function(handle) {
        let msg = `Getting records from ${xelib.Name(handle)}...`;
        progressService.progressMessage(msg);
    };

    let filteringMessage = function(current, max) {
        let msg = `Filtering records ${current + 1}/${max}...`;
        progressService.progressMessage(msg);
    };

    let resolveSearchScope = {
        'All files': function() {
            let handles = [];
            xelib.WithHandles(xelib.GetElements(), function(files) {
                files.forEach(function(file) {
                    gettingRecordsMessage(file);
                    handles.push(...xelib.GetRecords(file, '', true));
                });
            });
            return handles;
        },
        'Current file': function(nodes) {
            let file = xelib.GetElementFile(nodes[0].handle);
            gettingRecordsMessage(file);
            return xelib.GetRecords(file, '', true);
        },
        'Current group': function(nodes) {
            let group = xelib.GetElementGroup(nodes[0].handle);
            gettingRecordsMessage(group);
            return xelib.GetRecords(group, '', true);
        },
        'Selected records': function(nodes) {
            return nodes.map((node) => { return node.handle });
        }
    };

    let getCustomScopeFilenames = function(scope) {
        return scope.files.filterOnKey('active').mapOnKey('filename');
    };

    let getCustomScopeSignatures = function(scope) {
        return scope.groups.filterOnKey('active').joinOnKey('signature');
    };

    let resolveCustomScope = function(scope) {
        let signatures = getCustomScopeSignatures(scope),
            handles = [];
        getCustomScopeFilenames(scope).forEach(function(filename) {
            xelib.WithHandles(xelib.FileByName(filename), function(file) {
                gettingRecordsMessage(file);
                handles.push(...xelib.GetRecords(file, signatures, true));
            });
        });
        return handles;
    };

    let resolveScope = function(scope, nodes) {
        if (typeof scope === 'string') {
            return resolveSearchScope[scope](nodes);
        } else {
            return resolveCustomScope(scope);
        }
    };

    let setFilterResults = function(records) {
        xelib.ResetFilter();
        records.forEach(xelib.FilterRecord);
    };

    // PUBLIC
    this.search = function({nodes, scope, filterOptions}) {
        progressService.showProgress({ message: 'Searching...' });
        try {
            let records = resolveScope(scope, nodes),
                count = records.length,
                {filters, mode} = filterOptions,
                results = records.filter(function(record, index) {
                    if (index % 100 === 0) filteringMessage(index, count);
                    return service.filter(record, filters, mode);
                });
            progressService.progressMessage('Building tree...');
            setFilterResults(results);
            return results;
        } finally {
            progressService.hideProgress();
        }
    };

    this.filter = function(record, filters, filterMode) {
        return filterMode === 'or' ?
            filters.find((filter) => { return filter.test(record) }) :
            filters.reduce(function(passed, filter) {
                return passed && filter.test(record);
            }, true);
    };
});
