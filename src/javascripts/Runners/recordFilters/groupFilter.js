ngapp.run(function(recordFilterService, searchService) {
    recordFilterService.addFilter('Group', () => ({
        type: 'Group',
        mode: 'and',
        children: [],
        templateUrl: 'partials/filters/group.html',
        test: function(record) {
            let args = [record, this.children, this.mode];
            return searchService.filter(...args);
        }
    }));
});