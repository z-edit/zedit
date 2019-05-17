ngapp.service('recordFilterService', function() {
    let filters = {};

    this.addFilter = function(name, filter) {
        filters[name] = filter;
    };

    this.getFilters = () => filters;
});
