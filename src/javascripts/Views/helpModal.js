ngapp.controller('helpModalController', function($scope, helpService, errorService) {
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
        $scope.$emit('closeModal');
    };

    $scope.navigateTo = function(path) {
        selectTopic(helpService.getTopic(path, expandTopic));
        // TODO: scroll to top
    };

    // redirect help links internally
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

    // initialization
    $scope.xelib = xelib;
    $scope.topics = helpService.getTopics();
    selectTopic($scope.topics[0]);
});
