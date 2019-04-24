ngapp.run(function(recordFilterService) {
    recordFilterService.addFilter('Flag', (path = '') => ({
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
    }));
});