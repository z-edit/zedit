ngapp.run(function(buttonService) {
    let manageExtensionsButton = {
        priority: 998,
        title: 'Manage Extensions',
        class: 'extensions',
        onClick: scope => scope.$emit('openModal', 'manageExtensions'),
    };

    buttonService.addButton(manageExtensionsButton);
});
