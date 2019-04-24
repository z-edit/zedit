ngapp.run(function(recordFilterService) {
    let numberCompare = {
        'Equal to': (n, filter) => { return n === filter.value },
        'Not equal to': (n, filter) => { return n !== filter.value },
        'Greater than': (n, filter) => { return n > filter.value },
        'Less than': (n, filter) => { return n < filter.value },
        'Range': (n, filter) => {
            return n >= filter.value && n <= filter.secondValue;
        }
    };

    recordFilterService.addFilter('Number', (path = '') => ({
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
    }));
});