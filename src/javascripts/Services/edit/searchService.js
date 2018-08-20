ngapp.service('searchService', function(progressService, nodeHelpers) {
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

    let getRecordHandles = function(handles) {
        let records = [];
        xelib.WithHandles(handles, function(handles) {
            handles.forEach(function(handle) {
                gettingRecordsMessage(handle);
                records.unite(xelib.GetRecords(handle, '', true));
            });
        });
        return records;
    };

    let resolveSearchScope = {
        'All files': () => {
            return {
                shortLabel: 'All files',
                handles: getRecordHandles(xelib.GetElements())
            }
        },
        'Selected files': (nodes) => {
            let files = nodeHelpers.getUniqueHandles(nodes, xelib.etFile),
                filenames = Object.keys(files);
            return {
                shortLabel: `${filenames.length} files`,
                longLabel: `${filenames.join(', ')}`,
                handles: getRecordHandles(Object.values(files))
            }
        },
        'Selected groups': (nodes) => {
            let groups = nodeHelpers.getUniqueHandles(nodes, xelib.etGroupRecord),
                groupPaths = Object.keys(groups);
            return {
                short: `${groupPaths.length} groups`,
                long: `${groupPaths.join(', ')}`,
                handles: getRecordHandles(Object.values(groups))
            }
        },
        'Selected records': (nodes) => {
            return {
                shortLabel: `${nodes.length} records`,
                handles: nodeHelpers.getNodeHandles(nodes)
            }
        }
    };

    let getCustomScopeFilenames = function(customScope) {
        return customScope.files.filterOnKey('active').mapOnKey('filename');
    };

    let getCustomScopeSignatures = function(customScope) {
        return customScope.groups.filterOnKey('active').mapOnKey('signature');
    };

    let resolveCustomScope = function(customScope) {
        let signatures = getCustomScopeSignatures(customScope),
            signaturesStr = signatures.join(','),
            filenames = getCustomScopeFilenames(customScope),
            handles = [];
        filenames.forEach(function(filename) {
            xelib.WithHandle(xelib.FileByName(filename), function(file) {
                gettingRecordsMessage(file);
                handles.unite(xelib.GetRecords(file, signaturesStr, true));
            });
        });
        return {
            shortLabel: `${filenames.length} files, ${signatures.length} groups`,
            longLabel: `${filenames.join(', ')}; ${signaturesStr}`,
            handles: handles
        };
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
    this.search = function(options) {
        let {nodes, scope, filterOptions} = options;
        progressService.showProgress({ message: 'Searching...' });
        try {
            let resolvedScope = resolveScope(scope, nodes),
                records = resolvedScope.handles,
                count = records.length,
                {filters, mode} = filterOptions,
                results = records.filter(function(record, index) {
                    filteringMessage(index, count);
                    return service.filter(record, filters, mode);
                });
            options.scopeLabel = {
                short: resolvedScope.shortLabel,
                long: resolvedScope.longLabel
            };
            progressService.progressMessage('Building tree...');
            setFilterResults(results);
            return results;
        } finally {
            progressService.hideProgress();
        }
    };

    this.filter = function(record, filters, filterMode) {
        return filterMode === 'or' ?
            filters.find(filter => filter.test(record)) :
            filters.reduce(function(passed, filter) {
                return passed && filter.test(record);
            }, true);
    };
});
