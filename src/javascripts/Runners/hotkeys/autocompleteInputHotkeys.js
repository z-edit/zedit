ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('autocompleteInput', {
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        escape: 'handleEscape',
        enter: 'handleEnter'
    });
});
