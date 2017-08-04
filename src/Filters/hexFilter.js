export default function(ngapp) {
    ngapp.filter('hex', function() {
        return function(number, padding) {
            // return undefined if number is undefined
            if (!angular.isDefined(number)) return;
            // set up default padding
            if (typeof padding === 'undefined') padding = 2;

            // convert number to hex
            var hex = Number(number).toString(16).toUpperCase();
            // add 0 padding as necessary
            while (hex.length < padding) {
                hex = "0" + hex;
            }

            return hex;
        }
    });
}
