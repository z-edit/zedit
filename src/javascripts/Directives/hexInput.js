ngapp.directive('hexInput', function() {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            maxLength: '=?'
        },
        templateUrl: 'directives/hexInput.html',
        controller: 'hexInputController'
    }
});

ngapp.controller('hexInputController', function($scope) {
    Object.defaults($scope, {
        maxLength: 8
    });

    // helper functions
    let isHexKey = function(key) {
        return (key > 47 && key < 58) || (key > 64 && key < 71);
    };

    let focusNextSpan = function(e) {
        let nextSpan = e.srcElement.nextElementSibling;
        nextSpan ? nextSpan.focus() : e.srcElement.blur();
    };

    // scope functions
    $scope.onKeyDown = function(e, index) {
        if (!isHexKey(e.keyCode)) return;
        let char = String.fromCharCode(e.keyCode).toUpperCase();
        $scope.hexStr = $scope.hexStr.setChar(index, char);
        $scope.updateModel();
        focusNextSpan(e);
    };

    // two-way data binding for model
    $scope.updateModel = function() {
        $scope.model = parseInt($scope.hexStr, 16);
    };
    $scope.$watch('model', function() {
        $scope.hexStr = xelib.Hex($scope.model, $scope.maxLength);
    });
});