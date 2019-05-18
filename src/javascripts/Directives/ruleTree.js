ngapp.directive('ruleTree', function() {
    return {
        restrict: 'E',
        scope: {
            tree: '=?'
        },
        templateUrl: 'directives/ruleTree.html',
        controller: 'ruleTreeController'
    }
});

ngapp.controller('ruleTreeController', function($scope, $element, contextMenuService, smashRecordRuleService) {
    contextMenuService.buildFunctions($scope, 'ruleTree');

    $element[0].addEventListener('mousedown', function(e) {
        if (e.button === 2) $scope.showContextMenu(e);
    });

    // scope functions
    $scope.updateTreeEmpty = function() {
        $scope.treeEmpty = Object.keys($scope.tree).length === 0;
    };

    $scope.toggleExpansion = function(node) {
        node.expanded = !node.expanded;
    };

    $scope.clearSelection = function() {
        $scope.selectedRecord = null;
        Object.keys($scope.tree).forEach(key => {
            let record = $scope.tree[key];
            record.selected = false;
            $scope.selectedElement = null;
            record.elements.forEach(element => {
                element.selected = false;
            });
        });
    };

    $scope.select = function(e, sig) {
        $scope.clearSelection();
        let item = $scope.tree[sig];
        item.selected = true;
        $scope.selectedRecord = item;
        $scope.selectedSig = sig;
        e.stopPropagation();
    };

    $scope.addRecord = function(sig) {
        smashRecordRuleService.addRecord($scope.tree, sig);
        $scope.updateTreeEmpty();
    };

    $scope.addRecordsFromFile = function(filename) {
        smashRecordRuleService.addRecordsFromFile($scope.tree, filename);
        $scope.updateTreeEmpty();
    };

    $scope.addAllRecords = function() {
        smashRecordRuleService.addAllRecords($scope.tree);
        $scope.updateTreeEmpty();
    };

    $scope.removeRecord = function() {
        delete $scope.tree[$scope.selectedSig];
        $scope.updateTreeEmpty();
    };

    $scope.pruneRecords = function() {
        smashRecordRuleService.pruneRecords(tree);
        $scope.updateTreeEmpty();
    };

    // initialization
    $scope.updateTreeEmpty();
});
