ngapp.controller('editSmashPriorityModalController', function($scope) {
    // HELPER FUNCTIONS
    let init = function() {
        let {nodes} = $scope.modalOptions,
            node = nodes.find(node => node.data.priority);
        $scope.priority = node ? node.data.priority : 0;
    };

    // SCOPE FUNCTIONS
    $scope.setPriority = function() {
        let {nodes, nodesUpdated} = $scope.modalOptions;
        nodes.forEach(node => node.data.priority = $scope.priority);
        nodesUpdated(nodes);
        $scope.$emit('closeModal');
    };

    // initialization
    init();
});
