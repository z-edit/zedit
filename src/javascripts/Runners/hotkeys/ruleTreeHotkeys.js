ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('ruleTree', {
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        space: 'handleSpace',
        escape: [{
            callback: scope => scope.clearSelection(true)
        }],
        enter: 'handleEnter',
        a: [{
            modifiers: ['ctrlKey'],
            callback: 'selectAll'
        }],
        f: [{
            modifiers: ['ctrlKey'],
            callback: scope => scope.toggleFilter(true)
        }],
        pageUp: 'handlePageUp',
        pageDown: 'handlePageDown',
        delete: 'deleteRecords',
        insert: 'handleInsert'
    });
});
