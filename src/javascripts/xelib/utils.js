// UTILITY METHODS
xelib.IntToHex = function(n, padding = 8) {
    let str = Number(n).toString(16).toUpperCase();
    while (str.length < padding) str = '0' + str;
    return str;
};