ngapp.directive('focusOn', function() {
    return {
        restrict: 'A',
        scope: false,
        link: function(scope, element, attrs) {
            scope.$on(attrs.focusOn, () => element[0].focus());
        }
    }
});
