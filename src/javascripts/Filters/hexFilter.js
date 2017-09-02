ngapp.filter('hex', function() {
    return function(number, padding) {
        // return undefined if number is undefined
        if (!angular.isDefined(number)) return;
        // set up default padding
        if (typeof padding === 'undefined') padding = 2;

        // convert number to hex
        let hex = Number(number).toString(16).toUpperCase();
        // add 0 padding as necessary
        while (hex.length < padding) {
            hex = "0" + hex;
        }

        return hex;
    }
});