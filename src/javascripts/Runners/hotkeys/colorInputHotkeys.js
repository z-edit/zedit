ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('colorInput', {
        escape: 'handleEscape',
        enter: 'handleEnter'
    });
});
