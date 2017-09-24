ngapp.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('base', {
        url: '',
        redirectTo: 'base.start',
        templateUrl: 'partials/base.html',
        controller: 'baseController'
    });
}]);

ngapp.controller('baseController', function($scope, $rootScope, $document, $q, settingsService, themeService, buttonFactory, modalService, contextMenuService) {
    // helper variables
    let currentWindow = remote.getCurrentWindow();

    // helper functions
    let toggleMaximized = (w) => w.isMaximized() ? w.unmaximize() : w.maximize();

    // scope functions
    $scope.buttonClick = (button, e) => button.onClick($scope, e);
    $scope.extensionsClick = () => $scope.$emit('openModal', 'manageExtensions');
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
    $scope.$on('startDrag', (e, dragData) => $scope.$root.dragData = dragData);
    $scope.$on('stopDrag', () => $scope.$root.dragData = undefined);
    $scope.$on('setTitle', (e, title) => $scope.title = title);


    $scope.$on('restart', function() {
        remote.app.relaunch();
        remote.app.forceClose = true;
        currentWindow.close();
    });

    $scope.$on('terminate', function() {
        remote.app.forceClose = true;
        currentWindow.close();
    });

    $scope.$watch('title', () => document.title = $scope.title);

    // global keyboard shortcuts
    $document.bind('keydown', function(e) {
        if (e.keyCode === 73 && e.shiftKey && e.ctrlKey) { // ctrl + shift + i
            currentWindow.toggleDevTools();
        } else if (e.keyCode === 83 && e.ctrlKey) { // ctrl + s
            $scope.$broadcast('save');
        }
    });

    // initialization
    settingsService.loadGlobalSettings();
    themeService.init($scope);
    contextMenuService.init($scope);
    modalService.init($scope);
    $scope.title = 'zEdit - New Session';
    $scope.buttons = buttonFactory.buttons;
    $scope.$emit('appStart');
});
