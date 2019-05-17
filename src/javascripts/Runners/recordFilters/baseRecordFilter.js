ngapp.run(function(recordFilterService) {
    let buildSignatures = function(filter) {
        filter.signatures = filter.value.split(',').map(str => str.trim());
        return filter.signatures;
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

    recordFilterService.addFilter('Base Record', () => ({
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
    }));
});