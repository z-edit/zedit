ngapp.filter('classify', function() {
    return function(str) {
        if (typeof str !== 'string') return '';
        return str.underscore('-');
    }
});
