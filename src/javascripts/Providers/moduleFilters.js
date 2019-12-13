ngapp.value('moduleFilters', [{
    name: 'Search',
    type: 'text',
    description: 'Search module names and descriptions for specific text.',
    test: (module, value) => {
        return !value || module.name.contains(value, true) ||
            module.description.contains(value, true);
    }
}, {
    name: 'Author',
    type: 'text',
    description: 'Find modules by a specific author.',
    test: (module, value) => !value || module.author.contains(value, true)
}, {
    name: 'Games',
    type: 'options',
    options: [
        {name: 'Skyrim', id: 'TES5'},
        {name: 'Skyrim SE', id: 'SSE'},
        {name: 'Fallout 4', id: 'FO4'},
        {name: 'Fallout NV', id: 'FNV'},
        {name: 'Fallout 3', id: 'FO3'},
        {name: 'Oblivion', id: 'TES4'}
    ],
    description: 'Find modules for specific games.',
    test: (module, value) => {
        if (!module.games) return true;
        return module.games.some(g => value[g]);
    }
}, {
    name: 'Types',
    type: 'options',
    options: [
        {name: 'Core', id: 'core'},
        {name: 'API', id: 'api'},
        {name: 'Patcher', id: 'patcher'},
        {name: 'Tool', id: 'tool'}
    ],
    description: 'Find specific types of modules.',
    test: (module, value) => {
        if (!module.types) return;
        return module.types.some(t => value[t]);
    }
}]);
