ngapp.filter('classify', function() {
    return function(str) {
        if (!angular.isDefined(str)) return '';
        return str.replace(/ /g, '-');
    }
});
