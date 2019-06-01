ngapp.directive('ruleTree', function() {
    return {
        restrict: 'E',
        scope: {
            records: '=?'
        },
        templateUrl: 'directives/ruleTree.html',
        controller: 'ruleTreeController'
    }
});

ngapp.controller('ruleTreeController', function($scope, $element, contextMenuService, ruleTreeService, smashRecordRuleService, hotkeyService, nodeSelectionService, treeService) {
    // inherited functions
    treeService.buildFunctions($scope, $element);
    ruleTreeService.buildFunctions($scope, $element);
    nodeSelectionService.buildFunctions($scope, true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'ruleTree');
    contextMenuService.buildFunctions($scope, 'ruleTree');

    // event handlers
    $scope.toggleProcess = function(node) {
        if (!node.data.elements) return;
        let newState = node.data.process;
        node.data.elements.forEach(function toggleElement(e) {
            e.process = newState;
            if (!e.elements) return;
            e.elements.forEach(toggleElement);
        });
    };

    $scope.toggleDeletions = function() {
        $scope.selectedNodes.forEach(node => {
            node.data.deletions = !node.data.deletions;
            $scope.rebuildNode(node);
        });
    };

    $scope.toggleEntity = function() {
        $scope.selectedNodes.forEach(node => {
            node.data.entity = !node.data.entity;
            $scope.rebuildNode(node);
        });
    };

    $scope.createOrEditGroup = function() {
        $scope.$emit('openModal', 'editSmashGroup', {
            nodes: $scope.selectedNodes
        });
    };

    $scope.increasePriority = function() {
        $scope.selectedNodes.forEach(node => {
            node.data.priority = (node.data.priority || 0) + 100;
            $scope.rebuildNode(node);
        });
    };

    $scope.decreasePriority = function() {
        $scope.selectedNodes.forEach(node => {
            node.data.priority = (node.data.priority || 0) - 100;
            $scope.rebuildNode(node);
        });
    };

    $scope.setPriority = function() {
        $scope.$emit('openModal', 'editSmashPriority', {
            nodes: $scope.selectedNodes
        });
    };

    $scope.removeGroup = function() {
        $scope.selectedNodes.forEach(node => {
            delete node.data.group;
            $scope.rebuildNode(node);
        });
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
    };

    $scope.handleDelete = function(e) {
        $scope.deleteNodes();
        e.stopImmediatePropagation();
    };

    $scope.onMessageMouseDown = function(e) {
        if (e.button === 2) $scope.showContextMenu(e);
    };

    $scope.$on('nodeUpdated', (e, node) => {
        $scope.rebuildNode(node);
        $scope.setNodeModified(node);
    });

    // initialization
    $scope.resolveElements();
    $scope.buildTree();
});
