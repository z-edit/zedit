ngapp.controller('helpModalController', function($scope, helpService, modalService) {
    // inherited functions
    modalService.buildUnfocusModalFunction($scope);

    // helper functions
    let failedToResolveChildTopicError = function(label) {
        return new Error(`Failed to resolve child topic ${label}.`)
    };

    // scope functions
    $scope.topicClicked = (topic) => $scope.topic = topic;

    $scope.navigateTo = (path) => $scope.topic = helpService.getTopic(path);

    $scope.navigateToChild = function(label) {
        let child = $scope.topic.children.findByKey('label', label);
        if (!child) throw failedToResolveChildTopicError(label);
        $scope.topic = child;
    };

    // event handlers
    $scope.$on('treeItemClicked', function(e, item) {
        $scope.topicClicked(item);
        e.stopPropagation();
    });

    // initialization
    $scope.topics = helpService.getTopics();
    $scope.topic = $scope.topics[0];
});