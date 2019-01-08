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

            scope.$watch('texturePath', function() {
                context.clearRect(0, 0, canvas.width, canvas.height);
                let texturePath = `textures\\${scope.texturePath}`;
                if (fh.jetpack.exists(texturePath) !== 'file') return;
                let imageData = xelib.GetBitmapResource(texturePath);
                context.putImageData(imageData, 0, 0);
            });
        }
    }
});