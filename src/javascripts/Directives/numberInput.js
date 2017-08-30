ngapp.directive('numberInput', function() {
    let testFunctions = {
        positiveInteger: (str) => { return /^([0-9]+)$/i.test(str); },
        integer: (str) => { return /^\-?([0-9]+)$/i.test(str); },
        decimal: (str) => { return /^\-?([0-9]+)(\.[0-9]+)?$/i.test(str); }
    };

    return {
        restrict: 'E',
        replace: true,
        scope: {
            testFn: '=testFunction',
            model: '='
        },
        link: function(scope) {
            if (typeof scope.testFn === 'string') {
                scope.testFn = testFunctions[scope.testFn];
            }
            if (!scope.testFn || scope.testFn.constructor !== Function) {
                scope.testFn = testFunctions.decimal;
            }

            scope.updateModel = function() {
                scope.invalid = !scope.testFn(scope.str);
                if (!scope.invalid) scope.model = parseFloat(scope.str);
            };
            scope.$watch('model', () => scope.str = scope.model.toString());
        }
    }
});