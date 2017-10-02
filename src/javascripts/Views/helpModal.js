ngapp.controller('helpModalController', function($scope, $element, $timeout, helpService, errorService) {
    let modalContainerElement = $element[0].firstElementChild;

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
        // TODO: scroll to top
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

    $scope.$watch('topic', () => modalContainerElement.scrollTop = 0);

    // initialization
    $scope.xelib = xelib;
    $scope.topics = helpService.getTopics();
    selectTopic($scope.topics[0]);
});
