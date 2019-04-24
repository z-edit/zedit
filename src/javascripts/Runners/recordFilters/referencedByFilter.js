ngapp.run(function(recordFilterService) {
    let recordTypes, filenames;

    let getRecordTypes = function() {
        let map = xelib.GetSignatureNameMap();
        recordTypes = Object.keys(map).sort().map(signature => ({
            signature: signature,
            name: map[signature]
        }));
        return recordTypes;
    };

    let getFileNames = function() {
        filenames = xelib.GetLoadedFileNames();
        return filenames;
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

    recordFilterService.addFilter('Referenced By', () => ({
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
    }));
});