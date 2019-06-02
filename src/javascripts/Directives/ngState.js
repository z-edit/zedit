ngapp.directive('ngState', function() {
    const CHECKBOX_INDETERMINATE = 2;

    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            scope.$watch(attributes.ngState, value => {
                element[0].checked = Boolean(value);
                element[0].indeterminate = value === CHECKBOX_INDETERMINATE;
            });
        }
    }
});
