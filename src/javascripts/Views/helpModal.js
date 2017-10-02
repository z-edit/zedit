ngapp.controller('helpModalController', function($scope, $element, $timeout, helpService, errorService) {
    // helper variables
    let modalContainerElement = $element[0].firstElementChild;

    $scope.history = [];
    $scope.historyIndex = -1;

    // helper functions
    let selectTopic = function(topic) {
        if ($scope.topic) $scope.topic.selected = false;
        $scope.topic = topic;
        topic.selected = true;
    };

    let expandTopic = function(topic) {
        $scope.$broadcast('expandTreeNode', topic);
    };

    // scope functions
    $scope.closeModal = function() {
        $scope.topic.selected = false;
        $scope.$broadcast('collapseTree');
        $timeout(() => $scope.$emit('closeModal'));
    };

    $scope.navigateTo = function(path) {
        selectTopic(helpService.getTopic(path, expandTopic));
    };

    $scope.historyGo = function() {
        $scope.skipHistory = true;
        selectTopic($scope.history[$scope.historyIndex]);
    };

    $scope.back = function() {
        if ($scope.historyIndex <= 0) return;
        $scope.historyIndex--;
        $scope.historyGo();
    };

    $scope.forward = function() {
        if ($scope.historyIndex === $scope.history.length - 1) return;
        $scope.historyIndex++;
        $scope.historyGo();
    };

    // event listeners
    $scope.$on("helpNavigateTo", function(e, path) {
        errorService.try(function() {
            $scope.$applyAsync(() => $scope.navigateTo(path));
        });
    });

    $scope.$on('navigateToChild', function(e, child) {
        $scope.$broadcast('expandTreeNode', $scope.topic);
        selectTopic(child);
        e.stopPropagation && e.stopPropagation();
    });

    $scope.$watch('topic', function() {
        modalContainerElement.scrollTop = 0;
        if ($scope.skipHistory) {
            $scope.skipHistory = false;
            return;
        }
        $scope.history.push($scope.topic);
        $scope.historyIndex = $scope.history.length - 1;
    });

    // initialization
    $scope.xelib = xelib;
    $scope.topics = helpService.getTopics();
    selectTopic($scope.topics[0]);
});
