ngapp.directive('cellEditor', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/cellEditor.html',
        controller: 'cellEditorController'
    }
});

ngapp.controller('cellEditorController', function($scope, errorService, hotkeyService) {
    let cell = $scope.$parent.cell,
        node = $scope.$parent.node,
        index = $scope.$parent.$index,
        record = $scope.$parent.getRecord();

    $scope.newValue = cell.value;
    $scope.valueType = node.value_type;

    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'cellEditor');

    let setNewValue = function() {
        if (cell.value === $scope.newValue) return;
        let handle = node.handles[index - 1];
        xelib.SetValue(handle, '', $scope.newValue);
        $scope.$root.$broadcast('recordUpdated', record);
    };

    $scope.cancel = () => cell.editing = false;

    $scope.save = function() {
        errorService.try(setNewValue);
        cell.editing = false;
    };
});