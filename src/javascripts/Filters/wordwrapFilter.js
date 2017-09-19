ngapp.filter('wordwrap', function() {
    return function(str, width) {
        if (typeof str !== 'string') return '';
        return str.wordwrap(width || 60);
    };
});