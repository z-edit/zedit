ngapp.directive('hexEditor', function() {
    return {
        restrict: 'E',
        scope: {
            bytes: '='
        },
        templateUrl: 'directives/hexEditor.html',
        controller: 'hexEditorController'
    }
});

ngapp.controller('hexEditorController', function($scope) {
    let isHexKey = function(key) {
        return (key > 47 && key < 58) || (key > 64 && key < 71);
    };

    let focusNextSpan = function(e) {
        let nextSpan = e.srcElement.nextElementSibling;
        nextSpan ? nextSpan.focus() : e.srcElement.blur();
    };

    $scope.onByteKeyDown = function(e, index) {
        if (!isHexKey(e.keyCode)) return;
        let newChar = String.fromCharCode(e.keyCode).toUpperCase(),
            byte = $scope.bytes[index];
        if (byte[1] === ' ') {
            $scope.bytes[index] = byte[0] + newChar;
            focusNextSpan(e);
        } else {
            $scope.bytes[index] = newChar + ' ';
        }
    };

    $scope.onByteBlur = function(index) {
        let byte = $scope.bytes[index];
        if (byte[1] !== ' ') return;
        $scope.bytes[index] = '0' + byte[0];
    };
});