ngapp.directive('unfocusModal', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            let el = element[0],
                mouseDown = false,
                callback = $parse(attrs.unfocusModal),
                handleMouseUp = () => mouseDown = false;

            el.addEventListener('mousedown', function(e) {
                mouseDown = e.target === el;
            });
            el.addEventListener('mouseup', function(e) {
                if (!mouseDown || e.target !== el) return;
                if (callback) {
                    scope.$apply(() => callback(scope, {$event: e}))
                } else {
                    scope.$emit('closeModal');
                }
            });

            document.addEventListener('mouseup', handleMouseUp);
            scope.$on('destroy', function() {
                document.removeEventListener('mouseUp', handleMouseUp);
            });
        }
    }
});