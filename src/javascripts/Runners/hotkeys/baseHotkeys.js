ngapp.run(function(hotkeyService) {
    let ctrlDown = false;

    hotkeyService.addHotkeys('base', {
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
    });

    hotkeyService.addHotkeys('baseUp', {
        ctrl: scope => {
            scope.$broadcast('controlKeyReleased');
            ctrlDown = false;
        }
    });
});
