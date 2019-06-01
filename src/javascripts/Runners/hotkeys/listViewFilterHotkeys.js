ngapp.run(function(hotkeyService) {
    let closeFilter = (scope, e) => {
        e.stopPropagation();
        scope.toggleFilter(false);
    };

    hotkeyService.addHotkeys('listViewFilter', {
        escape: closeFilter,
        enter: closeFilter,
        a: [{
            modifiers: ['ctrlKey'],
            callback: (scope, e) => {
                e.stopPropagation();
                e.target.select();
            }
        }],
        space: [{
            modifiers: ['ctrlKey'],
            callback: 'handleSpace'
        }, {
            modifiers: ['shiftKey'],
            callback: 'handleSpace'
        }, {
            modifiers: [],
            callback: (scope, e) => {
                e.stopPropagation();
                e.target.value += ' ';
            }
        }]
    });
});
