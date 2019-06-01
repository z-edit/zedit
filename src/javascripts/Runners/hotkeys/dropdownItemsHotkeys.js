ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('dropdownItems', {
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        escape: 'hideDropdown',
        enter: 'selectItem'
    });
});
