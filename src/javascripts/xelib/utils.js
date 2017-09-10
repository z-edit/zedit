import { xelib } from './lib';

// UTILITY METHODS
Object.assign(xelib, {
    Hex: function(n, padding = 8) {
        let str = Number(n).toString(16).toUpperCase();
        while (str.length < padding) str = '0' + str;
        return str;
    }
});
