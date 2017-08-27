ngapp.directive('ngDrag', function($parse, $rootScope) {
    return function(scope, element, attrs) {
        let el = element[0],
            callback = $parse(attrs.ngDrag),
            executeCallback = (e) => {
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            };
        el.draggable = true;

        // event listeners
        el.addEventListener('dragstart', function(e) {
            if (!callback || !executeCallback(e)) {
                e.preventDefault();
                return;
            }
            e.dataTransfer.effectAllowed = 'move';
            el.classList.add('dragging');
        });
        el.addEventListener('dragend', () => {
            $rootScope.dragData = undefined;
            el.classList.remove('dragging');
        });
    }
});