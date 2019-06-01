ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('editValueModal', {
        enter: [{
            modifiers: ['ctrlKey'],
            callback: 'applyValue'
        }],
        s: [{
            modifiers: ['ctrlKey'],
            callback: 'applyValue'
        }],
        default: (scope, event) => scope.$broadcast('keyDown', event)
    });
});
