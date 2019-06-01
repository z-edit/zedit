ngapp.run(function(hotkeyService) {
    hotkeyService.addHotkeys('dropover', {
        escape: 'hideDropover',
        enter: 'select'
    });
});
