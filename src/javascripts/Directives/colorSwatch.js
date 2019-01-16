ngapp.directive('colorSwatch', function() {
    return {
        restrict: 'E',
        scope: {
            color: '='
        },
        template: '<div ng-drag="onDrag()" ng-drop="onDrop()" drag-over="onDragOver()"></div>',
        link: function(scope, element) {
            let el = element[0],
                div = el.firstElementChild;

            // helper functions
            let updateColor = function() {
                div.style.backgroundColor = scope.color.toRGBA();
                div.style.borderColor = scope.color.toRGB();
                div.title = scope.color.toRGBA();
            };

            // event handlers
            scope.onDrag = function() {
                scope.$root.dragData = {
                    source: 'colorSwatch',
                    color: scope.color
                };
                return true;
            };

            scope.onDragOver = function() {
                let dragData = scope.$root.dragData;
                if (dragData && dragData.source === 'colorSwatch') return true;
            };

            scope.onDrop = function() {
                let dragData = scope.$root.dragData;
                if (!dragData || dragData.source !== 'colorSwatch') return;
                scope.color.copyRGB(dragData.color);
            };

            scope.$watch('color', updateColor, true);
        }
    }
});
