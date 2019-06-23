ngapp.run(function($rootScope, buttonService) {
    let settingsButton = {
        priority: 999,
        title: 'Edit Settings',
        hidden: true,
        class: 'settings',
        onClick: scope => scope.$emit('openModal', 'settings'),
    };

    buttonService.addButton(settingsButton);
    $rootScope.$on('sessionStarted', () => settingsButton.hidden = false);
});
