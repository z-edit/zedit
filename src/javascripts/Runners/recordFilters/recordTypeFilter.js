ngapp.run(function(recordFilterService) {
    recordFilterService.addFilter('Record Type', () => ({
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
    }));
});