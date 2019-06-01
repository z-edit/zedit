ngapp.service('hotkeyService', function() {
    let keycodes = keyCodeService.getKeyCodes(),
        hotkeys = {};

    // HELPER FUNCTIONS
    let getSatisfiedAction = function(actions, e) {
        return actions.find(a => {
            return a.modifiers.reduce((b, modifier) => {
                return b && e[modifier];
            }, true);
        });
    };

    let trigger = function(scope, action, e, stop = false) {
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

    let triggerHotkey = function(scope, hotkeys, hotkey, e) {
        if (!hotkeys[hotkey]) return;
        let stop = hotkey !== 'default';
        if (trigger(scope, hotkeys[hotkey], e, stop)) return;
        if (hotkeys.default) trigger(scope, hotkeys.default, e);
    };

    let keyEventHandler = function(scope, hotkeys) {
        return function (e) {
            let hotkey = Object.keys(hotkeys).find(key => {
                return e.keyCode === keycodes[key];
            }) || 'default';
            triggerHotkey(scope, hotkeys, hotkey, e);
        };
    };

    let sortHotkeys = function(hotkeys) {
        hotkeys.sort((a, b) => {
            return a.modifiers.length - b.modifiers.length;
        });
    };

    let makeHotkeysArray = function(target, key) {
        target[key] = [{
            modifiers: [],
            callback: target[key]
        }];
    };

    let addHotkey = function(target, hotkeys, key) {
        if (typeof target[key] === 'string')
            makeHotkeysArray(target, key);
        target[key].push(hotkeys[key]);
        sortHotkeys(target[key]);
    };

    // PUBLIC API
    this.buildOnKeyDown = function(scope, label, view) {
        scope[label] = keyEventHandler(scope, hotkeys[view]);
    };

    this.buildOnKeyUp = function(scope, label, view) {
        scope[label] = keyEventHandler(scope, hotkeys[`${view}Up`]);
    };

    this.addHotkeys = function(label, newHotkeys) {
        let target = hotkeys[label];
        Object.keys(newHotkeys).forEach(key => {
            if (target.hasOwnProperty(key)) {
                addHotkey(target, newHotkeys, key);
            } else {
                target[key] = newHotkeys[key];
            }
        });
    };
});
