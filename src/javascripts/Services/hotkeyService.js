ngapp.service('hotkeyService', function(hotkeyFactory) {
    let keycodes = {
        backspace: 8, tab: 9, enter: 13, escape: 27, space: 32,
        shift: 16, ctrl: 17, alt: 18,
        pageUp: 33, pageDown: 34, end: 35, home: 36, delete: 46,
        leftArrow: 37, upArrow: 38, rightArrow: 39, downArrow: 40,
        plus: 61, minus: 173, tilde: 192
    };

    let buildKeyCodes = function(min, max, getKeyString) {
        for (let i = min; i <= max; i++) {
            keycodes[getKeyString(i)] = i;
        }
    };

    let keyFromCharCode = (i) => { return String.fromCharCode(i).toLowerCase() };
    buildKeyCodes(48, 57, keyFromCharCode); // 0-9
    buildKeyCodes(65, 90, keyFromCharCode); // a-z
    buildKeyCodes(112, 123, (i) => { return `f${i - 111}`; }); // f1-f12

    let getSatisfiedAction = function(actions, e) {
        return actions.find(function(a) {
            return a.modifiers.reduce(function(b, modifier) {
                return b && e[modifier];
            }, true);
        });
    };

    let trigger = function(scope, action, e) {
        let typeStr = typeof action;
        if (typeStr === 'object') {
            action = getSatisfiedAction(action, e);
            if (!action) return;
            action = action.callback;
        }
        action.Constructor === Function ? action(scope, e) : scope[action](e);
        e.stopImmediatePropagation();
        e.preventDefault();
    };

    this.buildOnKeyDown = function(scope, label, view) {
        let hotkeys = hotkeyFactory[`${view}Hotkeys`];
        scope[label] = function(e) {
            let hotkey = Object.keys(hotkeys).find(function(key) {
                return e.keyCode === keycodes[key];
            }) || 'else';
            if (!hotkeys[hotkey]) return;
            trigger(scope, hotkeys[hotkey], e);
        };
    };
});
