ngapp.directive('cellEditor', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/cellEditor.html',
        controller: 'cellEditorController'
    }
});

ngapp.controller('cellEditorController', function($scope, $timeout, $element, errorService, hotkeyService, htmlHelpers) {
    const refInputPath = 'reference-select/autocomplete-input/input';

    let cell = $scope.$parent.cell,
        node = $scope.$parent.node,
        index = $scope.$parent.$index,
        record = $scope.$parent.getRecord();

    // init scope variables
    $scope.handle = node.handles[index - 1];
    $scope.newValue = cell.value;
    $scope.valueType = node.value_type;
    $scope.isReference = node.value_type === xelib.vtReference;

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'cellEditor');

    // helper functions
    let setNewValue = function() {
        if (cell.value === $scope.newValue) return;
        xelib.SetValue($scope.handle, '', $scope.newValue);
        $scope.$root.$broadcast('recordUpdated', record);
    };

    let initReference = function() {
        $scope.signature = 'Any';
        $scope.signatures = xelib.GetAllowedSignatures($scope.handle).sort();
        let currentSignature = xelib.ExtractSignature($scope.newValue);
        if ($scope.signatures.includes(currentSignature))
            $scope.signature = currentSignature;
    };

    let focusInput = function() {
        let input = htmlHelpers.resolveElement($element[0], 'input') ||
            htmlHelpers.resolveElement($element[0], refInputPath);
        if (!input) return;
        input.focus();
        input.setSelectionRange(0, input.value.length);
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

    $scope.$on('saveEdit', $scope.save);
    $scope.$on('handleEnter', $scope.save);
    $scope.$on('handleEscape', $scope.stopEditing);

    // initialization
    if ($scope.isReference) initReference();
    $timeout(focusInput, 10);
});
