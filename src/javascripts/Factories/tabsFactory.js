ngapp.service('tabsFactory', function() {
    this.editMergeModalTabs = [{
        label: 'Details',
        class: 'details-tab',
        templateUrl: 'partials/editMerge/details.html'
    }, {
        label: 'Plugins',
        class: 'plugins-tab',
        templateUrl: 'partials/editMerge/plugins.html',
        controller: 'editMergePluginsController'
    }, {
        label: 'Data',
        class: 'data-tab',
        templateUrl: 'partials/editMerge/data.html',
        controller: 'editMergeDataController'
    }];

    this.editPatchModalTabs = [{
        label: 'Details',
        class: 'details-tab',
        templateUrl: 'partials/editPatch/details.html'
    }, {
        label: 'Plugins',
        class: 'plugins-tab',
        templateUrl: 'partials/editPatch/plugins.html',
        controller: 'editPatchPluginsController'
    }]
});