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
        label: 'Load Order',
        class: 'load-order-tab',
        templateUrl: 'partials/editMerge/loadOrder.html',
        controller: 'editMergeLoadOrderController'
    }, {
        label: 'Data',
        class: 'data-tab',
        templateUrl: 'partials/editMerge/data.html',
        controller: 'editMergeDataController'
    }];
});
