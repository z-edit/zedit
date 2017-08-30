ngapp.directive('numberInput', function() {
    let testFunctions = {
        positiveInteger: (str) => { return /^([0-9]+)$/i.test(str); },
        integer: (str) => { return /^\-?([0-9]+)$/i.test(str); },
        decimal: (str) => { return /^\-?([0-9]+)(\.[0-9]+)?$/i.test(str); }
    };

    return {
        restrict: 'E',
        template: '<input type="text" ng-model="str" ng-class="{\'invalid\' : invalid}" ng-change="updateModel()" ng-blur="onInputBlur()"/>',
        scope: {
            testFn: '=?',
            type: '@',
            model: '='
        },
        link: function(scope) {
            if (scope.type) {
                scope.testFn = testFunctions[scope.type];
            }
            if (!scope.testFn || scope.testFn.constructor !== Function) {
                scope.testFn = testFunctions.decimal;
            }
            if (typeof scope.model !== 'number') {
                scope.model = 0;
            }

            scope.onInputBlur = () => {
                if (scope.invalid) {
                    scope.invalid = false;
                    scope.str = scope.model.toString();
                }
            };
            scope.updateModel = function() {
                scope.invalid = !scope.testFn(scope.str);
                if (!scope.invalid) scope.model = parseFloat(scope.str);
            };
            scope.$watch('model', () => scope.str = scope.model.toString());
        }
    }
});