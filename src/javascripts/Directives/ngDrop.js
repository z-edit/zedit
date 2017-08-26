ngapp.directive('ngDrop', function($parse) {
    return function(scope, element, attrs) {
        let el = element[0],
            callback = $parse(attrs.ngDrop),
            executeCallback = (e) => {
                let result = false;
                scope.$apply(() => result = callback(scope, {$event: e}));
                return result;
            };

        // event listeners
        el.addEventListener('dragover', function(e) {
            e.dataTransfer.dropEffect = 'move';
            e.preventDefault();
            el.classList.add('dragover');
        });
        el.addEventListener('dragenter', () => el.classList.add('dragover'));
        el.addEventListener('dragleave', () => el.classList.remove('dragover'));
        el.addEventListener('drop', function(e) {
            if (!callback || !executeCallback(e)) return;
            e.stopPropagation();
            el.classList.remove('dragover');
        });
    }
});