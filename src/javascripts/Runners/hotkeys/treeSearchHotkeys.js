ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('treeSearch', {
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
    });
});
