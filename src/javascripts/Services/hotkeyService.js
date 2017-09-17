ngapp.service('hotkeyService', function(hotkeyFactory) {
    let service = this;

    this.keycodes = {
        backspace: 8, tab: 9, enter: 13, escape: 27, space: 32,
        pageUp: 33, pageDown: 34, end: 35, home: 36, delete: 46,
        leftArrow: 37, upArrow: 38, rightArrow: 39, downArrow: 40,
        plus: 61, minus: 173, tilde: 192
    };

    let buildKeyCodes = function(min, max, getKeyString) {
        for (let i = min; i <= max; i++) {
            service.keycodes[getKeyString(i)] = i;
        }
    };

    let keyFromCharCode = (i) => { return String.fromCharCode(i).toLowerCase() };
    buildKeyCodes(48, 57, keyFromCharCode); // 0-9
    buildKeyCodes(65, 90, keyFromCharCode); // a-z
    buildKeyCodes(112, 123, (i) => { return `F${i - 111}`; }); // F1-F12

    this.getSatisfiedAction = function(actions, e) {
        return actions.find(function(a) {
            return a.modifiers.reduce((b, modifier) => { return b && e[modifier] }, true);
        });
    };

    this.trigger = function(scope, action, e) {
        if (typeof action === 'object') {
            action = service.getSatisfiedAction(action, e);
            if (!action) return;
            scope[action.callback](e);
        } else {
            scope[action](e);
        }
        e.stopImmediatePropagation();
        e.preventDefault();
    };

    this.buildOnKeyDown = function(scope, label, view) {
        let hotkeys = hotkeyFactory[`${view}Hotkeys`];
        scope[label] = function(e) {
            let hotkey = Object.keys(hotkeys).find(function(key) {
                return e.keyCode === service.keycodes[key];
            }) || 'else';
            if (!hotkeys[hotkey]) return;
            service.trigger(scope, hotkeys[hotkey], e);
        };
    };
});
