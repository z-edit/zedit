ngapp.controller('helpModalController', function($scope, helpService, modalService) {
    // inherited functions
    modalService.buildUnfocusModalFunction($scope, 'closeModal');

    // helper functions
    let failedToResolveChildTopicError = function(label) {
        return new Error(`Failed to resolve child topic ${label}.`)
    };

    let selectTopic = function(topic) {
        if ($scope.topic) $scope.topic.selected = false;
        $scope.topic = topic;
        topic.selected = true;
    };

    // scope functions
    $scope.closeModal = function() {
        $scope.topic.selected = false;
        $scope.$emit('closeModal');
    };

    $scope.navigateTo = (path) => selectTopic(helpService.getTopic(path));

    $scope.navigateToChild = function(label) {
        let child = $scope.topic.children.findByKey('label', label);
        if (!child) throw failedToResolveChildTopicError(label);
        selectTopic(child);
    };

    // initialization
    $scope.topics = helpService.getTopics();
    selectTopic($scope.topics[0]);
});
