ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('contextMenu', {
        rightArrow: 'handleRightArrow',
        leftArrow: 'handleLeftArrow',
        upArrow: 'handleUpArrow',
        downArrow: 'handleDownArrow',
        escape: 'closeMenu',
        enter: 'clickItem'
    });
});
