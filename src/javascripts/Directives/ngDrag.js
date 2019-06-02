ngapp.directive('ngDrag', function($parse, $rootScope, eventService) {
    return function(scope, element, attrs) {
        let el = element[0],
            callback = $parse(attrs.ngDrag);
        el.draggable = true;

        let executeCallback = (e, callback) => {
            if (!callback) return;
            let result = false;
            scope.$apply(() => result = callback(scope, {$event: e}));
            return result;
        };

        // event listeners
        eventService.handleEvents(scope, element[0], {
            dragstart: e => {
                if (!executeCallback(e, callback)) {
                    e.preventDefault();
                    return;
                }
                e.dataTransfer.effectAllowed = 'move';
                el.classList.add('dragging');
            },
            dragend: () => {
                $rootScope.$broadcast('stopDrag');
                el.classList.remove('dragging');
            }
        });
    }
});
