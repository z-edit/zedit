ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('resolveModal', {
        w: 'nextError',
        rightArrow: 'nextError',
        q: 'previousError',
        leftArrow: 'previousError',
        default: (scope, event) => scope.handleResolutionKey(event)
    });
});
