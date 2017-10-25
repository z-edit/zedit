ngapp.directive('ngWheel', function($parse) {
    return {
        restrict: 'A',
        compile : function($element, attr) {
            let fn = $parse(attr['ngWheel']);
            return function ngEventHandler(scope, element) {
                element.on('wheel', function(event) {
                    scope.$apply(() => fn(scope, {$event: event}));
                });
            }
        }
    }
});
