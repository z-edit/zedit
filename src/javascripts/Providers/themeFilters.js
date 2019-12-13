ngapp.value('themeFilters', [{
    name: 'Search',
    type: 'text',
    description: 'Search theme names and descriptions for specific text.',
    test: (theme, input) => {
        return theme.name.includes(input) ||
            theme.description.includes(input);
    }
}, {
    name: 'Author',
    type: 'text',
    description: 'Find themes by a specific author.',
    test: (theme, input) => theme.author.includes(input)
}]);
