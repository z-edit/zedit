ngapp.directive('ngDrop', function($parse, eventService) {
    return function(scope, element, attrs) {
        let el = element[0],
            onDrop = $parse(attrs.ngDrop),
            onDragOver = $parse(attrs.dragOver),
            onDragLeave = $parse(attrs.dragLeave),
            executeCallback = (e, callback) => {
                if (!callback) return;
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            },
            canDrop = false,
            canTestDragOver = true;

        // helper functions
        let testDragOver = function(e) {
            if (!canTestDragOver) return;
            canTestDragOver = false;
            if (onDragOver) canDrop = executeCallback(e, onDragOver);
            if (canDrop) el.classList.add('dragover');
            setTimeout(() => canTestDragOver = true, 50);
        };

        // event listeners
        eventService.handleEvents(scope, element[0], {
            dragleave: e => {
                executeCallback(e, onDragLeave);
                el.classList.remove('dragover');
            },
            dragover: e => {
                e.dataTransfer.dropEffect = canDrop ? 'move' : 'none';
                if (canDrop) {
                    e.stopPropagation();
                    e.preventDefault();
                }
                testDragOver(e);
            },
            drop: e => {
                if (!canDrop) return;
                e.stopPropagation();
                executeCallback(e, onDrop);
                el.classList.remove('dragover');
            }
        });
    }
});
