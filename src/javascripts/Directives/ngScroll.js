ngapp.directive('ngScroll', function($parse) {
    return {
        restrict: 'A',
        compile : function($element, attr) {
            let fn = $parse(attr.ngScroll);
            return function ngEventHandler(scope, element) {
                element.on('scroll', function(event) {
                    scope.$apply(() => fn(scope, {$event: event}));
                });
            }
        }
    }
});
