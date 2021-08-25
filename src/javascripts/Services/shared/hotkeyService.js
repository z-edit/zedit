ngapp.service('hotkeyService', function(hotkeyFactory) {
    let keycodes = {
        backspace: 8, tab: 9, enter: 13, escape: 27, space: 32,
        shift: 16, ctrl: 17, alt: 18,
        pageUp: 33, pageDown: 34, end: 35, home: 36, insert: 45, delete: 46,
        leftArrow: 37, upArrow: 38, rightArrow: 39, downArrow: 40,
        plus: 61, minus: 173, tilde: 192
    };

    let buildKeyCodes = function(min, max, getKeyString) {
        for (let i = min; i <= max; i++) {
            keycodes[getKeyString(i)] = i;
        }
    };

    let keyFromCharCode = i => String.fromCharCode(i).toLowerCase();
    buildKeyCodes(48, 57, keyFromCharCode); // 0-9
    buildKeyCodes(65, 90, keyFromCharCode); // a-z
    buildKeyCodes(112, 123, i => `f${i - 111}`); // f1-f12

    let getSatisfiedAction = function(actions, e) {
        return actions.find(a => {
            return a.modifiers.reduce((b, modifier) => {
                return b && e[modifier];
            }, true);
        });
    };

    let trigger = function(scope, action, e, stop) {
        let typeStr = typeof action;
        if (typeStr === 'object') {
            action = getSatisfiedAction(action, e);
            if (!action) return;
            if (action.doNotStop) stop = false;
            action = action.callback;
            typeStr = typeof action;
        }
        typeStr === 'function' ? action(scope, e) : scope[action](e);
        stop && e.stopImmediatePropagation();
        stop && e.preventDefault();
        return true;
    };

    let keyEventHandler = function(scope, hotkeys) {
        return function (e) {
            let hotkey = Object.keys(hotkeys).find(key => {
                return e.keyCode === keycodes[key];
            }) || 'default';
            if (!hotkeys[hotkey]) return;
            if (!trigger(scope, hotkeys[hotkey], e, hotkey !== 'default')) {
                if (hotkeys.default) trigger(scope, hotkeys.default, e, false);
            }
        };
    };

    this.buildOnKeyDown = function(scope, label, view) {
        let hotkeys = hotkeyFactory[`${view}Hotkeys`];
        if (!hotkeys) return;
        scope[label] = keyEventHandler(scope, hotkeys);
    };

    this.buildOnKeyUp = function(scope, label, view) {
        let hotkeys = hotkeyFactory[`${view}HotkeysUp`];
        if (!hotkeys) return;
        scope[label] = keyEventHandler(scope, hotkeys);
    };
});
