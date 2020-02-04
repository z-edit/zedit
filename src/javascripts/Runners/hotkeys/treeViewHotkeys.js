ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('treeView', {
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
            callback: scope => scope.$emit('openModal', 'automate', {
                targetScope: scope
            })
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
    });
});
