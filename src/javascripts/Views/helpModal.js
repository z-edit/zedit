ngapp.controller('helpModalController', function($scope, helpService) {
    // helper functions
    let failedToResolveChildTopicError = function(label) {
        return new Error(`Failed to resolve child topic ${label}.`)
    };

    let selectTopic = function(topic) {
        if ($scope.topic) $scope.topic.selected = false;
        $scope.topic = topic;
        topic.selected = true;
    };

    let expandTopic = function(topic) {
        $scope.$broadcast('treeExpand', topic);
    };

    // scope functions
    $scope.closeModal = function() {
        $scope.topic.selected = false;
        $scope.$emit('closeModal');
    };

    $scope.navigateTo = function(path) {
        selectTopic(helpService.getTopic(path, expandTopic));
        // TODO: scroll to top
    };

    $scope.navigateToChild = function(child) {
        $scope.$broadcast('treeExpand', $scope.topic);
        selectTopic(child);
    };

    // initialization
    $scope.topics = helpService.getTopics();
    selectTopic($scope.topics[0]);
});
