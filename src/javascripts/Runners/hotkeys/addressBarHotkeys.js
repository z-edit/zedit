ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('addressBar', {
        enter: 'go',
        escape: 'closeBar'
    });
});
