ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('recordSearch', {
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
    });
});
