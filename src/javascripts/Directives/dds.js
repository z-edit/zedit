ngapp.directive('dds', function() {
    return {
        restrict: 'E',
        scope: {
            texturePath: '='
        },
        template: '<canvas ng-drag="onDrag()" ng-drop="onDrop()" drag-over="onDragOver()"></canvas>',
        link: function(scope, element) {
            let canvas = element[0].firstElementChild,
                context = canvas.getContext('2d');

            // event handlers
            scope.onDrag = function() {
                scope.$root.dragData = {
                    source: 'dds',
                    texturePath: scope.texturePath
                };
                return true;
            };

            scope.onDragOver = function() {
                let dragData = scope.$root.dragData;
                if (dragData && dragData.source === 'dds') return true;
            };

            scope.onDrop = function() {
                let dragData = scope.$root.dragData;
                if (!dragData || dragData.source !== 'dds') return;
                scope.texturePath = dragData.texturePath;
            };

            scope.$watch('texturePath', function() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                if (!scope.texturePath) return;
                let texturePath = `textures\\${scope.texturePath}`,
                    imageData = xelib.GetTextureData(texturePath),
                    d = Math.max(imageData.width, imageData.height);
                canvas.width = d;
                canvas.height = d;
                element[0].title = [
                    scope.texturePath,
                    `${imageData.width} x ${imageData.height}`
                ].join('\n');
                context.putImageData(imageData, 0, 0);
            });
        }
    }
});
