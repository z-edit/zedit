ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base', {
        url: '',
        redirectTo: 'base.start',
        templateUrl: 'partials/base.html',
        controller: 'baseController'
    });
}]);

ngapp.controller('baseController', function ($scope, $document) {
    var hostWindow = remote.getCurrentWindow();

    $scope.title = 'zEdit - New Session';

    $scope.settingsClick = function() {
        $scope.$broadcast('settingsClick');
    };

    $scope.helpClick = function () {
        $scope.$broadcast('helpClick');
    };

    $scope.minimizeClick = function () {
        hostWindow.minimize();
    };

    $scope.restoreClick = function () {
        if (hostWindow.isMaximized()) {
            hostWindow.unmaximize();
        } else {
            hostWindow.maximize();
        }
    };

    $scope.closeClick = function () {
        hostWindow.close();
    };

    $scope.$on('terminate', function() {
        remote.app.forceClose = true;
        $scope.closeClick();
    });

    $scope.$on('setTitle', function(e, title) {
        $scope.title = title;
    });

    $scope.$on('openContextMenu', function(e, offset, items) {
        $scope.showContextMenu = true;
        $scope.contextMenuOffset = offset;
        items.forEach(function(item) {
            item.templateUrl = `directives/contextMenu${item.divider ? 'Divider' : 'Item'}.html`;
        });
        $scope.contextMenuItems = items;
    });

    $scope.$on('closeContextMenu', function(e) {
        $scope.showContextMenu = false;
        e.stopPropagation();
    });

    // hide context menu when user clicks in document
    $document.bind('mousedown', function() {
        if ($scope.showContextMenu) {
            $scope.$applyAsync(() => $scope.showContextMenu = false);
        }
    });

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
