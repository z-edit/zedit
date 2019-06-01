ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('recordView', {
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
    });
});
