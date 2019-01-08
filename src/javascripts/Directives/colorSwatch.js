ngapp.directive('colorSwatch', function() {
    return {
        restrict: 'E',
        scope: {
            color: '='
        },
        template: '',
        link: function(scope, element) {
            let el = element[0];

            let onWheel = function(e) {
                let up = e.deltaY > 0,
                    oldAlpha = scope.color.getAlpha(10),
                    offset = up ? 5 : -5,
                    newAlpha = Math.min(0, Math.max(255, oldAlpha + offset));
                scope.color.setAlpha(newAlpha / 255.0);
            };

            let updateColor = function() {
                el.style.backgroundColor = scope.color.toRGBA();
                el.title = scope.color.toRGBA();
            };

            el.addEventListener('wheel', onWheel);
            scope.$watch('color', updateColor);

            scope.$on('$destroy', () => {
                el.removeEventListener('wheel', onWheel);
            });
        }
    }
});