ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.edit', {
        templateUrl: 'partials/edit.html',
        controller: 'editController',
        url: '/edit'
    });
}]);

ngapp.controller('editController', function ($scope, $timeout, layoutService, hotkeyService, viewFactory) {
    let getPluginItem = function(file) {
        return {
            handle: file,
            filename: xelib.Name(file),
            active: true
        }
    };

    let openSaveModal = function(shouldFinalize) {
        let plugins = xelib.GetElements()
            .filter(xelib.GetIsModified)
            .map(getPluginItem);
        if (!shouldFinalize && !plugins.length) return;
        $scope.$emit('openModal', 'save', {
            shouldFinalize: shouldFinalize,
            plugins: plugins
        });
    };

    let createFilterView = function() {
        let treeView = layoutService.findView(function(view) {
            return view.class === 'tree-view';
        });
        let filterView = viewFactory.newView('filterView', true);
        treeView.pane.tabs.forEach(function(tab) {
            tab.active = false;
        });
        treeView.pane.tabs.push(filterView);
        return filterView;
    };

    let ignore = function(e) {
        e.stopPropagation();
        e.preventDefault();
    };

    // event handlers
    document.addEventListener('mousedown', ignore, true);
    document.addEventListener('click', ignore, true);
    document.addEventListener('mouseup', ignore, true);

    $scope.onViewportRender = function() {
        if (verbose) logger.info('Rendering viewport...');
    };

    $scope.$on('settingsClick', function() {
        if (!$scope.loaded) return;
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', function() {
        if ($scope.$root.modalActive) return;
        openSaveModal(false);
    });

    $scope.$on('linkView', function(e, view) {
        $scope.$broadcast('toggleLinkMode', view);
        e.stopPropagation && e.stopPropagation();
    });

    $scope.$on('searchResults', function(e, options) {
        let filterView = layoutService.findView(function(view) {
            if (view.class === 'filter-view') {
                view.searchOptions.nodes.forEach(function(node) {
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

    $scope.$on('filesLoaded', function() {
        if (verbose) logger.info('Rendering editView');
        $scope.loaded = true;
        $timeout(() => {
            logger.info('Allowing click events');
            document.removeEventListener('mousedown', ignore, true);
            document.removeEventListener('click', ignore, true);
            document.removeEventListener('mouseup', ignore, true);
        }, 500);
    });

    // handle hotkeys
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'editView');

    // save data and terminate xelib when application is being closed
    window.onbeforeunload = function(e) {
        if (remote.app.forceClose) return;
        e.returnValue = false;
        if (!$scope.$root.modalActive) openSaveModal(true);
    };

    // initialization
    $scope.mainPane = layoutService.buildDefaultLayout();
});
