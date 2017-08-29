ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base', {
        url: '',
        redirectTo: 'base.start',
        templateUrl: 'partials/base.html',
        controller: 'baseController'
    });
}]);

    var hostWindow = remote.getCurrentWindow();

ngapp.controller('baseController', function ($scope, $document, $timeout, htmlHelpers, formUtils) {
    $scope.title = 'zEdit - New Session';

    // inherited functions
    formUtils.buildToggleModalFunction($scope, 'EditModal');

    // scope functions
    $scope.settingsClick = () => $scope.$broadcast('settingsClick');
    $scope.helpClick = () => $scope.$broadcast('helpClick');
    $scope.minimizeClick = () => hostWindow.minimize();
    $scope.restoreClick = () => {
        hostWindow.isMaximized() ? hostWindow.unmaximize() : hostWindow.maximize();
    };
    $scope.closeClick = () => hostWindow.close();
    $scope.toggleEditModal = (visible) => $scope.showEditModal = visible;

    // event handlers
    $scope.$on('terminate', function() {
        remote.app.forceClose = true;
        $scope.closeClick();
    });

    $scope.$on('setTitle', function(e, title) {
        $scope.title = title;
    });

    $scope.$on('openContextMenu', function(e, offset, items) {
        if (!items.length) return;
        $timeout(function() {
            $scope.showContextMenu = true;
            $scope.contextMenuOffset = offset;
            let buildTemplateUrl = function(item) {
                item.templateUrl = `directives/contextMenu${item.divider ? 'Divider' : 'Item'}.html`;
                if (item.children) item.children.forEach(buildTemplateUrl);
            };
            items.forEach(buildTemplateUrl);
            $scope.contextMenuItems = items;
        });
    });

    $scope.$on('closeContextMenu', function(e) {
        $scope.showContextMenu = false;
        e.stopPropagation();
    });

    $scope.$on('openEditModal', function(e, options) {
        $scope.showEditModal = true;
        $scope.editOptions = options;
        e.stopPropagation();
    });

    // hide context menu when user clicks in document
    $document.bind('mousedown', function(e) {
        if ($scope.showContextMenu) {
            let parentMenu = htmlHelpers.findParent(e.srcElement, function(element) {
                return element.tagName === 'CONTEXT-MENU';
            });
            if (parentMenu) return;
            $scope.$applyAsync(() => $scope.showContextMenu = false);
        }
    });

    // hide context menu when window loses focus
    window.onblur = () => $scope.$applyAsync(() => $scope.showContextMenu = false);

    // keyboard shortcuts
    $document.bind('keypress', function(e) {
        // ctrl + shift + i
        if (e.which === 9 && e.shiftKey && e.ctrlKey) {
            hostWindow.toggleDevTools();
        // ctrl + r
        } else if (e.which === 18 && e.ctrlKey) {
            location.reload();
        }
    });
});
