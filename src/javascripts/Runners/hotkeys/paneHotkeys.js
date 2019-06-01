ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('pane', {
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
    });
});
