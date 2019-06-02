ngapp.directive('unfocusModal', function($parse, eventService) {
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

            eventService.handleEvents(scope, el, {
                mousedown: e => {
                    if (clickingScrollBar(e)) return;
                    mouseDown = e.target === el;
                },
                mouseup: e => {
                    if (!mouseDown || e.target !== el) return;
                    if (callback) {
                        scope.$apply(() => callback(scope, {$event: e}));
                    } else {
                        scope.$emit('closeModal');
                    }
                }
            });

            eventService.handleEvents(scope, document, {
                mouseup: handleMouseUp
            });
        }
    }
});
