ngapp.directive('splitBar', function (htmlHelpers) {
    return {
        restrict: 'E',
        template: '<div class="bar"></div>',
        scope: {
            offset: '=?',
            resizeCallback: '=?',
            mode: '=?'
        },
        link: function(scope, element) {
            Object.defaults(scope, {
                offset: 0,
                mode: 0,
                $index: scope.$parent.$index
            });

            // helper variables
            let htmlElement = document.documentElement,
                container = element[0].parentElement,
                vertical = container.classList.contains('vertical'),
                targetDimension = vertical ? 'height' : 'width',
                clientLabel = vertical ? 'clientY' : 'clientX',
                sizeLabel = vertical ? 'offsetHeight' : 'offsetWidth',
                rectLabel = vertical ? 'top' : 'left',
                cursorClass = vertical ? 'row-resize' : 'col-resize',
                moving = false;

            // helper functions
            let getWidth = function(e, sizeElement) {
                let offset = sizeElement.getBoundingClientRect()[rectLabel],
                    size = e[clientLabel] - offset;
                if (scope.mode) return `${size}px`;
                let ratio = size / (container[sizeLabel] - scope.offset);
                return Math.min(ratio, 1.0).toPercentage(1);
            };

            // event handlers
            let handleMouseMove = function(e) {
                let sizeElement = element[0].previousElementSibling,
                    width = getWidth(e, sizeElement);
                sizeElement.style[targetDimension] = width;
                if (!scope.resizeCallback) return;
                scope.resizeCallback(scope.$index, width);
            };
            let handleMouseDown = function(e) {
                // only trigger when left mouse button is pressed
                if (e.button !== 0 && e.type !== 'touchstart') return;
                moving = true;
                htmlElement.className = cursorClass;
                htmlElement.addEventListener('mousemove', handleMouseMove);
                htmlElement.addEventListener('touchmove', handleMouseMove);
                e.preventDefault();
                e.stopImmediatePropagation();
            };
            let handleMouseUp = function(e) {
                if (!moving) return;
                moving = false;
                htmlElement.className = '';
                htmlElement.removeEventListener('mousemove', handleMouseMove);
                htmlElement.removeEventListener('touchmove', handleMouseMove);
                e.preventDefault();
                e.stopImmediatePropagation();
            };

            // event bindings
            element[0].addEventListener('mousedown', handleMouseDown);
            element[0].addEventListener('touchstart', handleMouseDown);
            htmlElement.addEventListener('mouseup', handleMouseUp);
            htmlElement.addEventListener('touchend', handleMouseUp);
            scope.$on('$destroy', function() {
                htmlElement.removeEventListener('mousemove', handleMouseMove);
                htmlElement.removeEventListener('touchmove', handleMouseMove);
                htmlElement.removeEventListener('mouseup', handleMouseUp);
                htmlElement.removeEventListener('touchend', handleMouseUp);
            });
        }
    }
});
