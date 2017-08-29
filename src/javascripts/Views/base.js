ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base', {
        url: '',
        redirectTo: 'base.start',
        templateUrl: 'partials/base.html',
        controller: 'baseController'
    });
}]);

ngapp.controller('baseController', function ($scope, $document, $timeout, htmlHelpers, formUtils) {
    // initialization
    var win = remote.getCurrentWindow();
    $scope.title = 'zEdit - New Session';

    // inherited functions
    formUtils.buildToggleModalFunction($scope, 'EditModal');

    // scope functions
    $scope.settingsClick = () => $scope.$broadcast('settingsClick');
    $scope.helpClick = () => $scope.$broadcast('helpClick');
    $scope.minimizeClick = () => win.minimize();
    $scope.restoreClick = () => win.isMaximized() ? win.unmaximize() : win.maximize();
    $scope.closeClick = () => win.close();

    // event handlers
    $scope.$on('terminate', () => { remote.app.forceClose = true;  win.close(); });
    $scope.$on('setTitle', (e, title) => $scope.title = title);

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
        $scope.editOptions = options;
        $scope.toggleEditModal(true);
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
    $document.bind('keydown', function(e) {
        if (e.keyCode === 73 && e.shiftKey && e.ctrlKey) { // ctrl + shift + i
            win.toggleDevTools();
        } else if (e.keyCode === 82 && e.ctrlKey) { // ctrl + r
            location.reload();
        } else if (e.keyCode === 83 && e.ctrlKey) { // ctrl + s
            $scope.$broadcast('save');
        }
    });
});
