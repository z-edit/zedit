ngapp.run(function(recordFilterService) {
    recordFilterService.addFilter('Array Item', (path = '') => ({
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
    }));
});