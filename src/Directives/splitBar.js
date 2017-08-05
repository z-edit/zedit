export default function(ngapp) {
    ngapp.directive('splitBar', function () {
        return {
            restrict: 'E',
            template: '<div class="bar"></div>',
            scope: true,
            link: function(scope, element) {
                // helper variables
                let htmlElement = document.documentElement;
                let container = element[0].parentElement;
                let vertical = container.classList.contains('vertical');
                let targetDimension = vertical ? 'height' : 'width';
                let clientLabel = vertical ? 'clientY' : 'clientX';
                let offsetLabel = vertical ? 'offsetTop' : 'offsetLeft';
                let sizeLabel = vertical ? 'offsetHeight' : 'offsetWidth';
                let moving = false;

                // event handlers
                let handleMouseMove = function(e) {
                    let paneElement = element[0].previousElementSibling;
                    let percentage = (e[clientLabel] - paneElement[offsetLabel]) / container[sizeLabel];
                    paneElement.style[targetDimension] = Math.min(percentage, 1.0).toPercentage(1);
                };
                let handleMouseDown = function(e) {
                    // only trigger when left mouse button is pressed
                    if (e.button !== 0 && e.type !== 'touchstart') return;
                    moving = true;
                    htmlElement.addEventListener('mousemove', handleMouseMove);
                    htmlElement.addEventListener('touchmove', handleMouseMove);
                    e.preventDefault();
                    e.stopPropagation();
                };
                let handleMouseUp = function(e) {
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
