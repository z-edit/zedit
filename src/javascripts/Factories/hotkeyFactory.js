ngapp.service('hotkeyFactory', function() {
    let factory = this;

    // PUBLIC HOTKEYS
    this.baseHotkeys = {
        i: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'toggleDevTools'
        }],
        s: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'toggleSettings'
        }, {
            modifiers: ['ctrlKey'],
            callback: (scope) => scope.$broadcast('save')
        }],
        e: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'openExtensionsModal'
        }],
        ctrl: (scope) => scope.$broadcast('controlKeyPressed')
    };

    this.baseHotkeysUp = {
        ctrl: (scope) => scope.$broadcast('controlKeyReleased')
    };

    this.editViewHotkeys = {};

    this.cleanViewHotkeys = {};

    this.treeViewHotkeys = {
        rightArrow: 'handleRightArrow',
        leftArrow: 'handleLeftArrow',
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        pageUp: 'handlePageUp',
        pageDown: 'handlePageDown',
        enter: 'handleEnter',
        delete: 'handleDelete',
        insert: 'handleInsert',
        f: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'toggleAdvancedSearch'
        }, {
            modifiers: ['ctrlKey'],
            callback: 'toggleSearchBar'
        }],
        m: [{
            modifiers: ['ctrlKey'],
            callback: (scope) => scope.$emit('openModal', 'automate')
        }],
        e: [{
            modifiers: ['ctrlKey'],
            callback: 'enableEditing'
        }],
        f2: 'rename',
        r: [{
            modifiers: ['altKey', 'shiftKey'],
            callback: 'rename'
        }],
        c: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'copyPaths'
        }, {
            modifiers: ['ctrlKey', 'altKey'],
            callback: 'copyInto'
        }, {
            modifiers: ['ctrlKey'],
            callback: 'copyNodes'
        }],
        v: 'handleV'
    };

    this.recordViewHotkeys = {
        leftArrow: [{
            modifiers: ['altKey'],
            callback: (scope) => scope.$broadcast('navBack')
        }, {
            modifiers: [],
            callback: 'handleRightArrow'
        }],
        rightArrow: [{
            modifiers: ['altKey'],
            callback: (scope) => scope.$broadcast('navForward')
        }, {
            modifiers: [],
            callback: 'handleLeftArrow'
        }],
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        pageUp: 'handlePageUp',
        pageDown: 'handlePageDown',
        enter: 'handleEnter',
        delete: 'deleteElements',
        insert: 'handleInsert',
        backspace: (scope) => scope.$broadcast('navBack'),
        f: [{
            modifiers: ['ctrlKey'],
            callback: 'toggleSearchBar'
        }],
        a: [{
            modifiers: ['ctrlKey'],
            callback: 'toggleAddressBar'
        }],
        r: [{
            modifiers: ['ctrlKey'],
            callback: 'toggleReplaceBar'
        }],
        f6: 'focusAddressInput'
    };

    this.treeSearchHotkeys = {
        escape: 'closeSearch',
        enter: [{
            modifiers: ['shiftKey'],
            callback: 'previousResult'
        }, {
            modifiers: [],
            callback: 'nextResult'
        }],
        x: [{
            modifiers: ['altKey'],
            callback: 'toggleExact'
        }],
        default: [{
            modifiers: ['altKey'],
            callback: 'setSearchBy'
        }]
    };

    this.recordSearchHotkeys = {
        escape: 'closeSearch',
        enter: [{
            modifiers: ['shiftKey'],
            callback: 'previousResult'
        }, {
            modifiers: [],
            callback: 'nextResult'
        }],
        default: [{
            modifiers: ['altKey'],
            callback: 'setSearchBy'
        }]
    };

    this.contextMenuHotkeys = {
        rightArrow: 'handleRightArrow',
        leftArrow: 'handleLeftArrow',
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        escape: 'closeMenu',
        enter: 'clickItem'
    };

    this.dropdownHotkeys = {
        downArrow: 'toggleDropdown',
        enter: 'toggleDropdown'
    };

    this.dropdownItemsHotkeys = {
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        escape: 'handleEscape',
        enter: 'handleEnter'
    };

    this.listViewHotkeys = {
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        space: 'handleSpace',
        escape: 'clearSelection',
        enter: 'handleEnter',
        a: [{
            modifiers: ['ctrlKey'],
            callback: 'selectAll'
        }]
    };

    this.automateModalHotkeys = {
        enter: [{
            modifiers: ['ctrlKey'],
            callback: 'runScript'
        }],
        delete: [{
            modifiers: ['ctrlKey'],
            callback: 'deleteScript'
        }],
        f2: 'handleF2',
        n: [{
            modifiers: ['ctrlKey'],
            callback: 'newScript'
        }],
        s: [{
            modifiers: ['ctrlKey'],
            callback: 'saveScript'
        }]
    };

    this.editValueModalHotkeys = {
        enter: [{
            modifiers: ['ctrlKey'],
            callback: 'applyValue'
        }],
        s: [{
            modifiers: ['ctrlKey'],
            callback: 'applyValue'
        }],
        escape: (scope) => scope.$emit('closeModal'),
        default: (scope, event) => scope.$broadcast('keyDown', event)
    };

    this.resolveModalHotkeys = {
        w: 'nextError',
        rightArrow: 'nextError',
        q: 'previousError',
        leftArrow: 'previousError',
        escape: (scope) => scope.$emit('closeModal'),
        default: (scope, event) => scope.handleResolutionKey(event)
    };

    // HELPER FUNCTIONS
    let sortHotkeys = function(hotkeys) {
        hotkeys.sort(function(a, b) {
            return a.modifiers.length - b.modifiers.length;
        });
    };

    let addHotkey = function(target, hotkeys, key) {
        if (typeof target[key] === 'string') {
            target[key] = [hotkeys[key], {
                modifiers: [],
                callback: target[key]
            }];
        } else {
            target[key].push(hotkeys[key]);
            sortHotkeys(target[key]);
        }
    };

    // PUBLIC API
    this.addHotkeys = function(label, hotkeys) {
        let target = factory[`${label}Hotkeys`];
        Object.keys(hotkeys).forEach(function(key) {
            if (target.hasOwnProperty(key)) {
                addHotkey(target, hotkeys, key);
            } else {
                target[key] = hotkeys[key];
            }
        });
    };
});
