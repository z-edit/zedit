ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.edit', {
        templateUrl: 'partials/edit.html',
        controller: 'editController',
        url: '/edit'
    });
}]);

ngapp.controller('editController', function ($scope, $timeout, layoutService, hotkeyService, viewFactory, eventService) {
    // helper funcstions
    let getPluginItem = function(file) {
        return {
            handle: file,
            filename: xelib.Name(file),
            active: true
        }
    };

    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        let plugins = xelib.GetElements()
            .filter(xelib.GetIsModified)
            .map(getPluginItem);
        if (!shouldFinalize && !plugins.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'editSaveModalController',
            shouldFinalize: shouldFinalize,
            plugins: plugins
        });
    };

    let createFilterView = function() {
        let treeView = layoutService.findView(view => {
            return view.class === 'tree-view';
        });
        let filterView = viewFactory.newView('filterView', true);
        treeView.pane.tabs.forEach(tab => tab.active = false);
        treeView.pane.tabs.push(filterView);
        return filterView;
    };

    // event handlers
    $scope.onViewportRender = function() {
        if (verbose) logger.info('Rendering viewport...');
    };

    $scope.$on('settingsClick', function() {
        if (!$scope.loaded) return;
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', () => openSaveModal(false));

    $scope.$on('linkView', function(e, view) {
        $scope.$broadcast('toggleLinkMode', view);
        e.stopPropagation && e.stopPropagation();
    });

    $scope.$on('searchResults', function(e, options) {
        let filterView = layoutService.findView(view => {
            if (view.class === 'filter-view') {
                view.searchOptions.nodes.forEach(node => {
                    xelib.Release(node.handle);
                });
                view.results.forEach(xelib.Release);
                return true;
            }
        }) || createFilterView();
        Object.assign(filterView, options);
    });

    $scope.$on('executingScript', function(e, scriptFilename) {
        logger.info(`Executing script ${scriptFilename}...`);
        layoutService.switchToView('log-view');
    });

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'editView');

    // save data and terminate xelib when application is being closed
    eventService.beforeClose(openSaveModal);

    // initialization
    $scope.mainPane = layoutService.buildDefaultLayout('Edit');
});
