ngapp.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('base.test', {
        templateUrl: 'partials/test.html',
        controller: 'testController',
        url: '/test'
    });
}]);

ngapp.controller('testController', function($rootScope, $scope, $timeout, progressService, eventService, testService, testStatusService, testRunner) {
    let {updateStatus, readyToBeBuilt} = testStatusService;

    // helper functions
    let updateTestStatuses = function() {
        $scope.tests.forEach(updateStatus);
    };

    let init = function() {
        progressService.showProgress({ message: 'Loading tests...' });
        $scope.tests = testService.loadTests();
        updateTestStatuses();
        progressService.hideProgress();
    };

    let openSaveModal = function(shouldFinalize = true) {
        if ($scope.$root.modalActive) return;
        if (!shouldFinalize && !$scope.tests.length) return;
        $scope.$emit('openModal', 'save', {
            controller: 'testSaveModalController',
            shouldFinalize: shouldFinalize,
            tests: $scope.tests
        });
    };

    // scope functions
    $scope.runTest = function(test) {
        testRunner.runTests([test]);
    };

    $scope.editTest = function(test) {
        $scope.$emit('openModal', 'editTest', { test });
    };

    $scope.deleteTest = function(test) {
        let msg = `Are you sure you want to delete the test "${test.name}"?`;
        if (!confirm(msg)) return;
        $scope.tests.remove(test);
    };

    $scope.createTest = function() {
        $scope.$emit('openModal', 'editTest', { tests: $scope.tests });
    };

    $scope.runTests = function() {
        let testsToRun = $scope.tests.filter(readyToBeBuilt);
        if (testsToRun.length === 0) return;
        testRunner.runTests(testsToRun);
    };

    // event handlers
    $scope.$on('settingsClick', function() {
        $scope.$emit('openModal', 'settings');
    });

    $scope.$on('save', () => openSaveModal(false));

    // save data and terminate xelib when application is being closed
    eventService.beforeClose(openSaveModal);

    // initialization
    $timeout(init);
});
