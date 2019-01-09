ngapp.directive('dds', function() {
    return {
        restrict: 'E',
        scope: {
            texturePath: '='
        },
        template: '<canvas></canvas>',
        link: function(scope, element) {
            let canvas = element[0].firstElementChild,
                context = canvas.getContext('2d');

            canvas.width = 512;
            canvas.height = 512;

            scope.$watch('texturePath', function() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                element[0].title = scope.texturePath;
                if (!scope.texturePath) return;
                let texturePath = `textures\\${scope.texturePath}`,
                    imageData = xelib.GetBitmapResource(texturePath);
                context.putImageData(imageData, 0, 0);
            });
        }
    }
});
