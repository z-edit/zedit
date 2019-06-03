ngapp.factory('hotkeyInterface', function(hotkeyService, keyCodeService) {
    let keycodes = keyCodeService.getKeyCodes();

    // PRIVATE FUNCTIONS
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

    // PUBLIC INTERFACE
    return function(scope, functionName, label) {
        let hotkeys = hotkeyService.getHotkeys(label);
        scope[functionName] = keyEventHandler(scope, hotkeys);
    };
});
