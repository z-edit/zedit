ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('ruleTree', {
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        rightArrow: 'handleRightArrow',
        leftArrow: 'handleLeftArrow',
        space: 'handleSpace',
        pageUp: 'handlePageUp',
        pageDown: 'handlePageDown',
        enter: 'handleEnter',
        delete: 'deleteRecords',
        escape: [{
            callback: scope => scope.clearSelection(true)
        }],
        f: [{
            modifiers: ['ctrlKey'],
            callback: scope => scope.toggleFilter(true)
        }]
    });
});
