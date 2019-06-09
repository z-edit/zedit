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

ngapp.controller('ruleTreeController', function($scope, $element, contextMenuInterface, ruleTreeInterface, smashRecordRuleService, hotkeyInterface, nodeSelectionInterface, treeInterface, checkboxTreeInterface) {
    // implement interfaces
    checkboxTreeInterface($scope);
    treeInterface($scope, $element, false, false);
    ruleTreeInterface($scope, $element);
    nodeSelectionInterface($scope, true);
    contextMenuInterface($scope, 'ruleTree');
    hotkeyInterface($scope, 'onTreeKeyDown', 'ruleTree');

    // helper functions
    let deleteEmptyGroup = function(node) {
        if (node.group.elements.length > 0) return;
        node.groups.remove(node.group);
    };

    let roundPriority = function(node) {
        if (Math.abs(node.data.priority) >= 51) return;
        node.data.priority = Math.round(node.data.priority / 100) * 100;
        if (node.data.priority === -0) node.data.priority = 0;
    };

    let nodesUpdated = nodes => nodes.forEach($scope.rebuildNode);

    // event handlers
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

    $scope.applyDefaultRules = function() {
        $scope.selectedNodes.forEach(node => {
            smashRecordRuleService.applyDefaultRules(node.data);
            $scope.updateNodes(node);
        });
    };

    $scope.createOrEditGroup = function() {
        let node = $scope.selectedNodes[0];
        $scope.$emit('openModal', 'editSmashGroup', {
            groups: node.groups,
            nodes: $scope.selectedNodes,
            siblingNodes: $scope.getChildNodes(node.parent),
            nodesUpdated
        });
    };

    $scope.increasePriority = function() {
        $scope.selectedNodes.forEach(node => {
            node.data.priority = (node.data.priority || 0) + 100;
            roundPriority(node);
            $scope.rebuildNode(node);
        });
    };

    $scope.decreasePriority = function() {
        $scope.selectedNodes.forEach(node => {
            node.data.priority = (node.data.priority || 0) - 100;
            roundPriority(node);
            $scope.rebuildNode(node);
        });
    };

    $scope.setPriority = function() {
        $scope.$emit('openModal', 'editSmashPriority', {
            nodes: $scope.selectedNodes,
            nodesUpdated
        });
    };

    $scope.removeGroup = function() {
        $scope.selectedNodes.forEach(node => {
            if (!node.group) return;
            node.group.elements.remove(node.name);
            deleteEmptyGroup(node);
            delete node.data.group;
            delete node.group;
            $scope.rebuildNode(node);
        });
    };

    // event handlers
    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
    };

    $scope.handleSpace = function(e) {
        $scope.$applyAsync(() => {
            $scope.selectedNodes.forEach(node => {
                $scope.toggleCheckbox(node);
            });
        });
        e.stopImmediatePropagation();
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
