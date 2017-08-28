ngapp.directive('ngDragLeave', function($parse) {
    return function(scope, element, attrs) {
        let el = element[0],
            callback = $parse(attrs.ngDragLeave),
            executeCallback = (e) => {
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            };

        // event listeners
        el.addEventListener('dragleave', function(e) {
            callback && executeCallback(e);
            el.classList.remove('dragover');
        });
    }
});