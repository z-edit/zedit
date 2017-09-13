ngapp.directive('ngDrop', function($parse) {
    return function(scope, element, attrs) {
        let el = element[0],
            dropCallback = $parse(attrs.ngDrop),
            dragOverCallback = $parse(attrs.dragOver),
            dragLeaveCallback = $parse(attrs.dragLeave),
            executeCallback = (e, callback) => {
                if (!callback) return;
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            },
            canDrop = false;

        // event listeners
        el.addEventListener('dragleave', function(e) {
            executeCallback(e, dragLeaveCallback);
            el.classList.remove('dragover');
        });

        el.addEventListener('dragover', function(e) {
            canDrop = executeCallback(e, dragOverCallback);
            if (!canDrop) {
                e.dataTransfer.dropEffect = 'none';
            } else {
                el.classList.add('dragover');
                e.dataTransfer.dropEffect = 'move';
                e.preventDefault();
            }
        });

        el.addEventListener('drop', function(e) {
            if (!canDrop) return;
            e.stopPropagation();
            executeCallback(e, dropCallback);
            el.classList.remove('dragover');
        });
    }
});
