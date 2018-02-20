ngapp.directive('cellEditor', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/cellEditor.html',
        controller: 'cellEditorController'
    }
});

ngapp.controller('cellEditorController', function($scope, $element, errorService, hotkeyService) {
    let cell = $scope.$parent.cell,
        node = $scope.$parent.node,
        index = $scope.$parent.$index,
        record = $scope.$parent.getRecord();

    // init scope variables
    $scope.newValue = cell.value;
    $scope.valueType = node.value_type;

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'cellEditor');

    // helper functions
    let setNewValue = function() {
        if (cell.value === $scope.newValue) return;
        let handle = node.handles[index - 1];
        xelib.SetValue(handle, '', $scope.newValue);
        $scope.$root.$broadcast('recordUpdated', record);
    };

    // scope functions
    $scope.stopPropagation = e => e.stopPropagation();

    $scope.stopEditing = function() {
        cell.editing = false;
        $scope.$parent.treeElement.focus();
    };

    $scope.save = function() {
        errorService.try(setNewValue);
        $scope.stopEditing();
    };

    $scope.selectText = function(e) {
        e.target.setSelectionRange(0, e.target.value.length);
    }
});