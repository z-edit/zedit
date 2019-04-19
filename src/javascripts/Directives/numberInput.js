ngapp.directive('numberInput', function() {
    let parseFunctions = {
        positiveInteger: parseInt,
        integer: parseInt,
        decimal: parseFloat,
        bytes: parseBytes
    };

    let testFunctions = {
        positiveInteger: str => /^([0-9]+)$/i.test(str),
        integer: str => /^\-?([0-9]+)$/i.test(str),
        decimal: str => /^\-?([0-9]+)(\.[0-9]+)?$/i.test(str),
        bytes: str => /^([0-9]+)(\.[0-9]+)? (gb|mb|kb|bytes)/i.test(str)
    };

    return {
        restrict: 'E',
        template: '<input type="text" ng-model="str" ng-class="{\'invalid\' : invalid}" ng-change="updateModel()" ng-blur="onInputBlur()"/>',
        scope: {
            testFn: '=?',
            parseFn: '=?',
            type: '@',
            model: '='
        },
        link: function(scope) {
            if (!scope.type)
                scope.type = 'decimal';

            if (typeof scope.model !== 'number')
                scope.model = 0;

            scope.onInputBlur = () => {
                if (!scope.invalid) return;
                scope.invalid = false;
                scope.str = scope.model.toString();
            };

            scope.updateModel = function() {
                scope.invalid = !scope.testFn(scope.str);
                if (scope.invalid) return;
                scope.model = scope.parseFn(scope.str);
            };

            scope.$watch('model', () => {
                scope.str = scope.type === 'bytes' ?
                    scope.model.toBytes() : scope.model.toString();
            });

            scope.$watch('type', () => {
                if (!scope.type) return;
                scope.testFn = testFunctions[scope.type];
                scope.parseFn = parseFunctions[scope.type];
            });
        }
    }
});
