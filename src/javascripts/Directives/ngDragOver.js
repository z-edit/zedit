ngapp.directive('ngDragOver', function($parse) {
    return function(scope, element, attrs) {
        let el = element[0],
            callback = $parse(attrs.ngDragOver),
            executeCallback = (e) => {
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            },
            canDrop = false;

        // event listeners
        el.addEventListener('dragenter', function(e) {
            canDrop = callback && executeCallback(e);
            if (!canDrop) return;
            el.classList.add('dragover');
        });
        el.addEventListener('dragover', function(e) {
            if (!canDrop) return;
            e.dataTransfer.dropEffect = 'move';
            e.preventDefault();
        });
        el.addEventListener('dragleave', () => el.classList.remove('dragover'));
    }
});