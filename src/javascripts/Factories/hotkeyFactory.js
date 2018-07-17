ngapp.service('hotkeyFactory', function() {
    let factory = this,
        ctrlDown = false;

    // PUBLIC HOTKEYS
    this.baseHotkeys = {
        i: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'toggleDevTools'
        }],
        s: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: scope => scope.$broadcast('openModal', 'settings')
        }, {
            modifiers: ['ctrlKey'],
            callback: scope => scope.$broadcast('save')
        }],
        h: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: scope => scope.$emit('openModal', 'help')
        }],
        e: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: scope => scope.$emit('openModal', 'manageExtensions')
        }],
        ctrl: scope => {
            if (ctrlDown) return;
            scope.$broadcast('controlKeyPressed');
            ctrlDown = true;
        },
        escape: 'handleEscape'
    };

    this.baseHotkeysUp = {
        ctrl: scope => {
            scope.$broadcast('controlKeyReleased');
            ctrlDown = false;
        }
    };

    this.editViewHotkeys = {};

    this.paneHotkeys = {
        tab: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'previousTab'
        }, {
            modifiers: ['ctrlKey'],
            callback: 'nextTab'
        }],
        t: [{
            modifiers: ['ctrlKey'],
            callback: 'newTab'
        }],
        w: [{
            modifiers: ['ctrlKey'],
            callback: 'closeCurrentTab'
        }]
    };

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
            callback: 'openAdvancedSearchModal'
        }, {
            modifiers: ['ctrlKey'],
            callback: scope => scope.toggleSearchBar(true)
        }],
        m: [{
            modifiers: ['ctrlKey'],
            callback: scope => scope.$emit('openModal', 'automate')
        }],
        e: [{
            modifiers: ['ctrlKey'],
            callback: 'enableEditing'
        }],
        s: [{
            modifiers: ['ctrlKey', 'altKey'],
            callback: 'savePluginAs'
        }],
        f2: 'refactor',
        r: [{
            modifiers: ['altKey', 'shiftKey'],
            callback: 'refactor'
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
        v: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: scope => scope.pasteNodes(false)
        }, {
            modifiers: ['ctrlKey'],
            callback: scope => scope.pasteNodes(true)
        }],
        b: [{
            modifiers: ['ctrlKey'],
            callback: 'buildReferences'
        }],
        default: 'handleLetter'
    };

    this.recordViewHotkeys = {
        leftArrow: [{
            modifiers: ['altKey'],
            callback: scope => scope.$broadcast('navBack')
        }, {
            modifiers: [],
            callback: 'handleLeftArrow'
        }],
        rightArrow: [{
            modifiers: ['altKey'],
            callback: scope => scope.$broadcast('navForward')
        }, {
            modifiers: [],
            callback: 'handleRightArrow'
        }],
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        pageUp: 'handlePageUp',
        pageDown: 'handlePageDown',
        enter: 'handleEnter',
        delete: 'deleteElements',
        insert: 'handleInsert',
        backspace: scope => scope.$broadcast('navBack'),
        c: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: 'copyPaths'
        }, {
            modifiers: ['ctrlKey'],
            callback: 'copyNodes'
        }],
        v: [{
            modifiers: ['ctrlKey', 'shiftKey'],
            callback: scope => scope.pasteNodes(true)
        }, {
            modifiers: ['ctrlKey'],
            callback: scope => scope.pasteNodes()
        }],
        f: [{
            modifiers: ['ctrlKey'],
            callback: scope => scope.toggleSearchBar(true)
        }],
        r: [{
            modifiers: ['ctrlKey'],
            callback: 'toggleReplaceBar'
        }],
        f6: scope => scope.toggleAddressBar(true)
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

    this.addressBarHotkeys = {
        enter: 'go',
        escape: 'closeBar'
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
        default: (scope, event) => scope.$broadcast('keyDown', event)
    };

    this.resolveModalHotkeys = {
        w: 'nextError',
        rightArrow: 'nextError',
        q: 'previousError',
        leftArrow: 'previousError',
        default: (scope, event) => scope.handleResolutionKey(event)
    };

    this.referencedByViewHotkeys = {
        enter: 'handleEnter'
    };

    this.cellEditorHotkeys = {
        enter: 'save',
        escape: 'stopEditing',
        default: 'stopPropagation'
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
