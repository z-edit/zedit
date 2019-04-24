ngapp.run(function(recordFilterService) {
    recordFilterService.addFilter('Reference', (path = '') => ({
        type: 'Reference',
        path: path,
        value: '',
        templateUrl: 'partials/filters/reference.html',
        exportKeys: ['path', 'value'],
        test: function(record) {
            let value = xelib.GetValue(record, this.path);
            return value === this.value;
        }
    }));
});