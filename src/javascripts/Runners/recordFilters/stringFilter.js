ngapp.run(function(recordFilterService) {
    let buildRegex = function(filter) {
        let flags = filter.ignoreCase ? 'gi' : 'g';
        filter.expr = new RegExp(filter.value, flags);
        return filter.expr;
    };

    let hasStringValue = function(record, filter) {
        let element = record;
        while(element) {
            element = xelib.FindNextElement(element, filter.value, false, true);
            let value = xelib.GetValue(element);
            if (stringCompare[filter.compareType](value, filter)) return true;
        }
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

    recordFilterService.addFilter('String', (path = '') => ({
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
    }));
});