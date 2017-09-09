ngapp.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('base', {
        url: '',
        redirectTo: 'base.start',
        templateUrl: 'partials/base.html',
        controller: 'baseController'
    });
}]);

ngapp.controller('baseController', function($scope, $document, $q, $timeout, settingsService, themeService, modalService, htmlHelpers) {
    // initialization
    let currentWindow = remote.getCurrentWindow(),
        themeStylesheet = document.getElementById('theme');
    settingsService.loadGlobalSettings();
    $scope.title = 'zEdit - New Session';
    $scope.theme = themeService.getCurrentTheme();
    $scope.$emit('appStart');

    // helper functions
    let toggleMaximized = (w) => w.isMaximized() ? w.unmaximize() : w.maximize();

    // scope functions
    $scope.settingsClick = () => $scope.$broadcast('settingsClick');
    $scope.helpClick = () => $scope.$broadcast('helpClick');
    $scope.minimizeClick = () => currentWindow.minimize();
    $scope.restoreClick = () => toggleMaximized(currentWindow);
    $scope.closeClick = () => currentWindow.close();

    // prompt modal functions
    $scope.$root.prompt = function(options) {
        $scope.promptPromise = $q.defer();
        $scope.$emit('openModal', 'prompt', options);
        return $scope.promptPromise.promise;
    };

    // event handlers
    $scope.$on('terminate', () => {
        remote.app.forceClose = true;
        currentWindow.close();
    });
    $scope.$on('setTitle', (e, title) => $scope.title = title);
    $scope.$on('setTheme', (e, theme) => $scope.theme = theme);
    $scope.$watch('title', () => document.title = $scope.title);
    $scope.$watch('theme', () => themeStylesheet.href = `themes/${$scope.theme}`);

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

    $scope.$on('openModal', function(e, label, options = {}) {
        $scope.$applyAsync(function() {
            $scope.$root.modalActive = true;
            $scope.modalOptions = modalService.buildOptions(label, options);
            $scope.showModal = true;
        });
        e.stopPropagation();
    });

    $scope.$on('closeModal', function(e) {
        $scope.$applyAsync(function() {
            $scope.$root.modalActive = false;
            $scope.modalOptions = undefined;
            $scope.showModal = false;
        });
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

    // global keyboard shortcuts
    $document.bind('keydown', function(e) {
        if (e.keyCode === 73 && e.shiftKey && e.ctrlKey) { // ctrl + shift + i
            currentWindow.toggleDevTools();
        } else if (e.keyCode === 82 && e.ctrlKey) { // ctrl + r
            location.reload();
        } else if (e.keyCode === 83 && e.ctrlKey) { // ctrl + s
            $scope.$broadcast('save');
        }
    });
});
