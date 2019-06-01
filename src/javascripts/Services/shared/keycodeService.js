ngapp.service('keycodeService', function() {
    let baseKeyCodes = {
        backspace: 8, tab: 9, enter: 13, escape: 27, space: 32,
        shift: 16, ctrl: 17, alt: 18,
        pageUp: 33, pageDown: 34, end: 35, home: 36, insert: 45, delete: 46,
        leftArrow: 37, upArrow: 38, rightArrow: 39, downArrow: 40,
        plus: 61, minus: 173, tilde: 192
    };

    let keyFromCharCode = i => String.fromCharCode(i).toLowerCase();
    let fKeyFromCharCode = i => `f${i - 111}`;

    let buildKeyCodes = function(keycodes, min, max, getKeyString) {
        for (let i = min; i <= max; i++) {
            keycodes[getKeyString(i)] = i;
        }
    };

    // PUBLIC API
    this.getKeyCodes = function() {
        let keycodes = Object.assign({}, baseKeyCodes);
        buildKeyCodes(keycodes, 48, 57, keyFromCharCode); // 0-9
        buildKeyCodes(keycodes, 65, 90, keyFromCharCode); // a-z
        buildKeyCodes(keycodes, 112, 123, fKeyFromCharCode); // f1-f12
        return keycodes;
    };
});
