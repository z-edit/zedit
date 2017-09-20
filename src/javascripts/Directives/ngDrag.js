ngapp.directive('ngDrag', function($parse, $rootScope) {
    return function(scope, element, attrs) {
        let el = element[0],
            callback = $parse(attrs.ngDrag),
            executeCallback = (e, callback) => {
                if (!callback) return;
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            };
        el.draggable = true;

        // event listeners
        el.addEventListener('dragstart', function(e) {
            if (!executeCallback(e, callback)) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.effectAllowed = 'move';
            el.classList.add('dragging');
        });

        el.addEventListener('dragend', () => {
            $rootScope.$broadcast('stopDrag');
            el.classList.remove('dragging');
        });
    }
});
