ngapp.directive('cellEditor', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/cellEditor.html',
        controller: 'cellEditorController'
    }
});

ngapp.controller('cellEditorController', function($scope, $timeout, $element, errorService, hotkeyInterface, htmlHelpers) {
    const refInputPath = 'reference-select/autocomplete-input/input',
        enumSelectPath = 'enum-select/select';

    let cell = $scope.$parent.cell,
        node = $scope.$parent.node,
        index = $scope.$parent.$index,
        record = $scope.$parent.getRecord();

    // init scope variables
    $scope.handle = node.handles[index - 1];
    $scope.newValue = cell.value;
    $scope.valueType = node.value_type;
    $scope.isReference = node.value_type === xelib.vtReference;
    $scope.isEnum = node.value_type === xelib.vtEnum;
    $scope.isOther = !$scope.isEnum && !$scope.isReference;

    // inherited functions
    hotkeyInterface($scope, 'onKeyDown', 'cellEditor');

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
        let el = $element[0],
            input = htmlHelpers.resolveElement(el, 'input') ||
                htmlHelpers.resolveElement(el, refInputPath) ||
                htmlHelpers.resolveElement(el, enumSelectPath);
        if (!input) return;
        input.focus();
        if (input.hasOwnProperty('setSelectionRange'))
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
