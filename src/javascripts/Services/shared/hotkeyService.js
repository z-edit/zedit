ngapp.service('hotkeyService', function() {
    let hotkeys = {};

    // HELPER FUNCTIONS
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
    this.addHotkeys = function(label, newHotkeys) {
        let target = hotkeys[label];
        if (!target) target = hotkeys[label] = {};
        Object.keys(newHotkeys).forEach(key => {
            if (target.hasOwnProperty(key)) {
                addHotkey(target, newHotkeys, key);
            } else {
                target[key] = newHotkeys[key];
            }
        });
    };

    this.getHotkeys = function(label) {
        return hotkeys[label];
    }
});
