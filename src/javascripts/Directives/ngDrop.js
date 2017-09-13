ngapp.directive('ngDrop', function($parse) {
    return function(scope, element, attrs) {
        let el = element[0],
            dropCallback = $parse(attrs.ngDrop),
            dragOverCallback = $parse(attrs.dragOver),
            dragEnterCallback = $parse(attrs.dragEnter),
            dragLeaveCallback = $parse(attrs.dragLeave),
            executeCallback = (e, callback) => {
                if (!callback) return;
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            },
            canDrop = false;

        // event listeners
        el.addEventListener('dragenter', function(e) {
            canDrop = executeCallback(e, dragEnterCallback);
            if (canDrop) console.log('We can drop here.');
        });

        el.addEventListener('dragleave', function(e) {
            executeCallback(e, dragLeaveCallback);
            el.classList.remove('dragover');
        });

        el.addEventListener('dragover', function(e) {
            if (dragOverCallback) {
                canDrop = executeCallback(e, dragOverCallback);
                if (canDrop) console.log('We can drop here.');
            }
            if (canDrop) {
                el.classList.add('dragover');
                e.dataTransfer.dropEffect = 'move';
                e.preventDefault();
            } else {
                e.dataTransfer.dropEffect = 'none';
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
