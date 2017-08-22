ngapp.directive('ngRightClick', function($parse) {
    return {
        restrict: 'A',
        compile : function($element, attr) {
            let fn = $parse(attr['ngRightClick']);
            return function ngEventHandler(scope, element) {
                element.on('contextmenu', function(event) {
                    scope.$apply(() => fn(scope, {$event: event}));
                });
            }
        }
    }
});