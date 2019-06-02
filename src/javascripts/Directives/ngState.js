ngapp.directive('ngState', function(eventService) {
    const CHECKBOX_INDETERMINATE = 2;

    return {
        restrict: 'A',
        link: function(scope, element, attributes) {
            eventService.handleEvents(scope, element[0], {
                dblclick: e => e.stopPropagation()
            });

            scope.$watch(attributes.ngState, value => {
                element[0].checked = Boolean(value);
                element[0].indeterminate = value === CHECKBOX_INDETERMINATE;
            });
        }
    }
});
