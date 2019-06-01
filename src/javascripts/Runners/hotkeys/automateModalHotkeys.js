ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('automateModal', {
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
    });
});
