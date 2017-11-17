ngapp.service('filterFactory', function(searchService) {
    let recordTypes, filenames;

    let getRecordTypes = function() {
        let map = xelib.GetSignatureNameMap();
        recordTypes = Object.keys(map).sort().map(function(signature) {
            return {
                signature: signature,
                name: map[signature]
            }
        });
        return recordTypes;
    };

    let getFileNames = function() {
        filenames = xelib.GetLoadedFileNames();
        return filenames;
    };

    let buildRegex = function(filter) {
        let flags = filter.ignoreCase ? 'gi' : 'g';
        filter.expr = new RegExp(filter.value, flags);
        return filter.expr;
    };

    let buildSignatures = function(filter) {
        filter.signatures = filter.value.split(',').map(String.prototype.trim);
        return filter.signatures;
    };

    let stringCompare = {
        'Exact match': (str, filter) => {
            return str.equals(filter.value, filter.ignoreCase);
        },
        'Contains': (str, filter) => {
            return str.contains(filter.value, filter.ignoreCase);
        },
        'Regex': (str, filter) => {
            let expr = filter.expr || buildRegex(filter);
            return expr.test(str);
        }
    };

    let hasStringValue = function(record, filter) {
        let element = record;
        while(element) {
            element = xelib.FindNextElement(element, filter.value, false, true);
            let value = xelib.GetValue(element);
            if (stringCompare[filter.compareType](value, filter)) return true;
        }
    };

    let numberCompare = {
        'Equal to': (n, filter) => { return n === filter.value },
        'Not equal to': (n, filter) => { return n !== filter.value },
        'Greater than': (n, filter) => { return n > filter.value },
        'Less than': (n, filter) => { return n < filter.value },
        'Range': (n, filter) => {
            return n >= filter.value && n <= filter.secondValue;
        }
    };

    let baseCompare = {
        'Signature': (base, filter) => {
            let signatures = filter.signatures || buildSignatures(filter);
            return signatures.includes(xelib.Signature(base));
        },
        'Editor ID': (base, filter) => {
            let str = xelib.EditorID(base);
            return str.contains(filter.value, filter.ignoreCase);
        },
        'Name': (base, filter) => {
            let str = xelib.FullName(base);
            return str.contains(filter.value, filter.ignoreCase);
        }
    };

    let referencedByCompare = {
        'Record Type': (ref, filter) => {
            return xelib.Signature(ref) === filter.value;
        },
        'File': (ref, filter) => {
            let result = false;
            xelib.WithHandle(xelib.GetElementFile(ref), function(refFile) {
                result = xelib.Name(refFile) === filter.value;
            });
            return result;
        }
    };

    this.filters = {
        'String': function(path = '') {
            return {
                type: 'String',
                path: path,
                compareType: 'Contains',
                value: '',
                templateUrl: 'partials/filters/string.html',
                exportKeys: ['path', 'compareType', 'value', 'allPaths', 'ignoreCase'],
                allPaths: false,
                ignoreCase: false,
                allPathsChanged: function() {
                    if (this.compareType !== 'Regex') return;
                    this.compareType = 'Contains';
                },
                test: function(record) {
                    if (this.allPaths) return hasStringValue(record, this);
                    let value = xelib.GetValue(record, this.path);
                    return stringCompare[this.compareType](value, this);
                }
            }
        },
        'Number': function(path = '') {
            return {
                type: 'Number',
                path: path,
                compareType: 'Equal to',
                value: 0,
                secondValue: 0,
                templateUrl: 'partials/filters/number.html',
                exportKeys: ['path', 'compareType', 'value', 'secondValue'],
                test: function(record) {
                    let value = xelib.GetValue(record, this.path),
                        num = parseFloat(value);
                    return numberCompare[this.compareType](num, this);
                }
            }
        },
        'Reference': function(path = '') {
            return {
                type: 'Reference',
                path: path,
                value: '',
                templateUrl: 'partials/filters/reference.html',
                exportKeys: ['path', 'value'],
                test: function(record) {
                    let value = xelib.GetValue(record, this.path);
                    return value === this.value;
                }
            }
        },
        'Base Record': function() {
            return {
                type: 'Base Record',
                compareType: 'Signature',
                placeholders: {
                    'Signature': 'Enter a comma separated list of signatures',
                    'Editor ID': 'Enter a substring to search for',
                    'Name': 'Enter a substring to search for'
                },
                value: '',
                ignoreCase: false,
                templateUrl: 'partials/filters/baseRecord.html',
                exportKeys: ['compareType', 'value', 'ignoreCase'],
                test: function(record) {
                    if (!xelib.HasElement(record, 'NAME')) return;
                    let base = xelib.GetLinksTo(record, 'NAME');
                    return baseCompare[this.compareType](base, this);
                }
            }
        },
        'Flag': function(path = '') {
            return {
                type: 'Flag',
                path: path,
                value: '',
                notPresent: false,
                templateUrl: 'partials/filters/flag.html',
                exportKeys: ['path', 'value', 'notPresent'],
                test: function(record) {
                    let state = xelib.GetFlag(record, this.path, this.value);
                    return state === !this.notPresent;
                }
            }
        },
        'Array Item': function(path = '') {
            return {
                type: 'Array Item',
                path: path,
                subpath: '',
                value: '',
                notPresent: false,
                templateUrl: 'partials/filters/arrayItem.html',
                exportKeys: ['path', 'subpath', 'value', 'notPresent'],
                test: function(record) {
                    let args = [record, this.path, this.subpath, this.value];
                    return xelib.HasArrayItem(...args) !== this.notPresent;
                }
            }
        },
        'Record Type': function() {
            return {
                type: 'Record Type',
                master: true,
                override: true,
                injected: true,
                notInjected: true,
                templateUrl: 'partials/filters/recordType.html',
                exportKeys: ['master', 'override', 'injected', 'notInjected'],
                test: function(record) {
                    let injected = xelib.IsInjected(record),
                        master = xelib.IsMaster(record);
                    return (injected && this.injected ||
                        !injected && this.notInjected) &&
                        (master && this.master ||
                        !master && this.override);
                }
            }
        },
        'Conflict Status': function(path = '') {
            let filter = {
                type: 'Conflict Status',
                path: path,
                conflictAllOptions: xelib.conflictAll,
                conflictThisOptions: xelib.conflictThis,
                templateUrl: 'partials/filters/conflictStatus.html',
                exportKeys: ['path']
                    .concat(xelib.conflictAll)
                    .concat(xelib.conflictThis),
                test: function(record) {
                    let nodes = xelib.GetNodes(record),
                        element = xelib.GetElement(record, path);
                    try {
                        let [ca, ct] = xelib.GetConflictData(nodes, element);
                        return this[xelib.conflictAll[ca]] &&
                            this[xelib.conflictThis[ct]];
                    } finally {
                        xelib.ReleaseNodes(nodes);
                        xelib.Release(element);
                    }
                }
            };
            xelib.conflictAll.forEach((ca) => filter[ca] = true);
            xelib.conflictThis.forEach((ct) => filter[ct] = true);
            return filter;
        },
        'Referenced By': function() {
            return {
                type: 'Referenced By',
                compareType: 'Record Type',
                recordTypes: recordTypes || getRecordTypes(),
                filenames: filenames || getFileNames(),
                templateUrl: 'partials/filters/referencedBy.html',
                exportKeys: ['compareType', 'value'],
                test: function(record) {
                    let compareFn = referencedByCompare[this.compareType],
                        refs = xelib.GetReferencedBy(record);
                    try {
                        return refs.find((ref) => {
                            return compareFn(ref, this);
                        });
                    } finally {
                        refs.forEach(xelib.Release);
                    }
                }
            }
        },
        'Group': function() {
            return {
                type: 'Group',
                mode: 'and',
                children: [],
                templateUrl: 'partials/filters/group.html',
                test: function(record) {
                    let args = [record, this.children, this.mode];
                    return searchService.filter(...args);
                }
            }
        }
    };
});
