ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('listView', {
        upArrow: [{
            doNotStop: true,
            modifiers: [],
            callback: 'handleUpArrow'
        }],
        downArrow: [{
            doNotStop: true,
            modifiers: [],
            callback: 'handleDownArrow'
        }],
        space: [{
            doNotStop: true,
            modifiers: [],
            callback: 'handleSpace'
        }],
        escape: [{
            doNotStop: true,
            modifiers: [],
            callback: scope => scope.clearSelection(true)
        }],
        enter: [{
            doNotStop: true,
            modifiers: [],
            callback: 'handleEnter'
        }],
        a: [{
            doNotStop: true,
            modifiers: ['ctrlKey'],
            callback: 'selectAll'
        }],
        f: [{
            doNotStop: true,
            modifiers: ['ctrlKey'],
            callback: scope => scope.toggleFilter(true)
        }]
    });
});
