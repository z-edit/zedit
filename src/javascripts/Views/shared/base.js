ngapp.config(['$stateProvider', function($stateProvider) {
    $stateProvider.state('base', {
        url: '',
        redirectTo: 'base.start',
        templateUrl: 'partials/base.html',
        controller: 'baseController'
    });
}]);

ngapp.controller('baseController', function($scope, $rootScope, $q, $timeout, protocolService, settingsService, themeService, buttonService, modalService, hotkeyInterface, contextMenuService, eventService) {
    // helper variables
    let currentWindow = remote.getCurrentWindow();

    // helper functions
    let toggleMaximized = (w) => w.isMaximized() ? w.unmaximize() : w.maximize();

    // scope functions
    $scope.buttonClick = (button, e) => button.onClick($scope, e);
    $scope.minimizeClick = () => currentWindow.minimize();
    $scope.restoreClick = () => toggleMaximized(currentWindow);
    $scope.closeClick = () => currentWindow.close();
    $scope.toggleDevTools = () => currentWindow.toggleDevTools();

    $scope.handleEscape = function() {
        $scope.$broadcast('escapePressed');
    };

    // prompt modal functions
    $rootScope.prompt = function(options) {
        $scope.promptPromise = $q.defer();
        $scope.$emit('openModal', 'prompt', options);
        return $scope.promptPromise.promise;
    };

    // event handlers
    currentWindow.on('closed', logger.close);

    $scope.$on('startDrag', (e, dragData) => $rootScope.dragData = dragData);
    $scope.$on('stopDrag', () => $rootScope.dragData = undefined);
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

    $scope.$on('backgroundChanged', function(e, background) {
        $scope.backgroundStyle = {
            'background': `url('${background.url}')`,
            'background-size': 'cover',
            'background-position': 'center'
        };
    });

    $scope.$watch('title', () => document.title = $scope.title);

    // global hotkeys
    hotkeyInterface($scope, 'onKeyDown', 'base');
    hotkeyInterface($scope, 'onKeyUp', 'baseUp');
    eventService.handleEvents($scope, document.body, {
        keydown: $scope.onKeyDown,
        keyup: $scope.onKeyUp
    });

    // initialization
    settingsService.loadGlobalSettings();
    themeService.init($scope);
    contextMenuService.init($scope);
    modalService.init($scope);
    protocolService.init($scope);
    $scope.title = 'zEdit - New Session';
    $scope.buttons = buttonService.getButtons();
    $scope.$emit('appStart');
});
