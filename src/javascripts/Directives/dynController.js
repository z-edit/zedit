ngapp.directive('dynController', function($controller, $parse) {
    let getController = function(ctrlName, scope, element, attrs) {
        return $controller(ctrlName, {
            $scope: scope,
            $element: element,
            $attrs: attrs
        });
    };

    let resolveController = function(ctrlExpr, scope, element, attrs) {
        let ctrl = $parse(ctrlExpr)(scope);
        if (!ctrl) return;
        return typeof ctrl === 'string' ? getController(ctrl, scope, element, attrs) : ctrl;
    };

    return {
        restrict: 'A',
        scope: true,
        link: function(scope, element, attrs) {
            attrs.$observe('dynController', function(ctrlExpr) {
                let controller = resolveController(ctrlExpr, scope, element, attrs);
                if (!controller) return;
                element.data('$Controller', controller);
            });
        }
    }
});
