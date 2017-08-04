export default function(ngapp) {
    ngapp.directive('splitBar', function () {
        return {
            restrict: 'E',
            template: '<div class="bar"></div>',
            scope: true,
            link: function(scope, element) {
                // helper variables
                var htmlElement = document.documentElement;
                var container = element[0].parentElement;
                var vertical = container.classList.contains('vertical');
                var targetDimension = vertical ? 'height' : 'width';
                var clientLabel = vertical ? 'clientY' : 'clientX';
                var offsetLabel = vertical ? 'offsetTop' : 'offsetLeft';
                var sizeLabel = vertical ? 'offsetHeight' : 'offsetWidth';
                var moving = false;

                // event handlers
                var handleMouseMove = function(e) {
                    var paneElement = element[0].previousElementSibling;
                    var percentage = (e[clientLabel] - paneElement[offsetLabel]) / container[sizeLabel];
                    paneElement.style[targetDimension] = Math.min(percentage, 1.0).toPercentage(1);
                };
                var handleMouseDown = function(e) {
                    // only trigger when left mouse button is pressed
                    if (e.button !== 0 && e.type !== 'touchstart') return;
                    moving = true;
                    htmlElement.addEventListener('mousemove', handleMouseMove);
                    htmlElement.addEventListener('touchmove', handleMouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                };
                var handleMouseUp = function(e) {
                    if (!moving) return;
                    moving = false;
                    htmlElement.removeEventListener('mousemove', handleMouseMove);
                    htmlElement.removeEventListener('touchmove', handleMouseMove);
                    e.preventDefault();
                    e.stopPropagation();
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
}
