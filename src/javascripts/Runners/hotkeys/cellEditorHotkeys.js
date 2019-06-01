ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('cellEditor', {
        enter: 'save',
        escape: 'stopEditing',
        default: 'stopPropagation'
    });
});
