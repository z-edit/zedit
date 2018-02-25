ngapp.directive('unfocusModal', function($parse) {
    return {
        restrict: 'A',
        link: function(scope, element, attrs) {
            let el = element[0],
                mouseDown = false,
                callback = attrs.unfocusModal && $parse(attrs.unfocusModal),
                handleMouseUp = () => mouseDown = false;

            let clickingScrollBar = function(e) {
                let hasVerticalScrollBar = el.scrollHeight > el.clientHeight;
                if (!hasVerticalScrollBar) return;
                return e.clientX > el.clientWidth - 1;
            };

            el.addEventListener('mousedown', function(e) {
                if (clickingScrollBar(e)) return;
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
