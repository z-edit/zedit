export default function(ngapp, xelib, remote) {
    ngapp.config(['$stateProvider', function ($stateProvider) {
        $stateProvider.state('base.main', {
            templateUrl: 'partials/main.html',
            controller: 'mainController',
            url: '/main'
        });
    }]);

    ngapp.controller('mainController', function ($scope, $rootScope, $timeout, spinnerFactory, xelibService, layoutService) {
        $scope.loaded = false;
        $scope.log = xelib.GetMessages();
        $scope.spinnerOpts = spinnerFactory.defaultOptions;
        xelibService.printGlobals();

        // load default layout
        $scope.mainPane = layoutService.getDefaultLayout();

        // scope functions
        $scope.toggleSettingsModal = function(visible) {
            $scope.showSettingsModal = visible;
        };

        $scope.getLoadingMessage = function() {
            $scope.loadingMessage = $scope.log.split('\n').slice(-2)[0];
        };

        $scope.checkIfLoaded = function() {
            $scope.log = $scope.log + xelib.GetMessages();
            $scope.getLoadingMessage();
            if (xelib.GetLoaderDone()) {
                console.log($scope.log);
                $scope.loaded = true;
            } else {
                $timeout($scope.checkIfLoaded, 250);
            }
        };

        // terminate xelib when application is done
        window.onbeforeunload = function(e) {
            if (remote.app.forceClose) return;
            //$scope.toggleSaveModal(true);
            e.returnValue = true;//false;
        };

        $scope.checkIfLoaded();
    });
}
