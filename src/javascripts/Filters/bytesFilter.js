ngapp.filter('bytes', function() {
    return function(number, precision) {
        if (typeof number === "string") number = parseInt(number);
        if (isNaN(parseFloat(number)) || !isFinite(number)) return '-';
        if (number === 0) return '0 bytes';
        return number.toBytes(precision);
    }
});
