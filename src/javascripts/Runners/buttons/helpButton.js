ngapp.run(function(buttonService) {
    let helpButton = {
        priority: 1000,
        title: 'Get Help',
        class: 'help',
        onClick: scope => scope.$emit('openModal', 'help'),
    };

    buttonService.addButton(helpButton);
});
