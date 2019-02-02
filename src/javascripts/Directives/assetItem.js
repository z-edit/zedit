ngapp.directive('assetItem', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/assetItem.html',
        link: function(scope, element) {
            // initialization
            scope.item.image = scope.item.type === 'folder' ?
                'images/folder.png' : 'images/file.png';
            scope.showDds = scope.item.ext === 'dds';

            // helper functions
            let tooltipTimeout = null;

            let resolvePath = function(item) {
                if (!item.parent) return item.name;
                return `${resolvePath(item.parent)}\\${item.name}`;
            };

            let getTitle = function() {
                let filePath = scope.item.filePath,
                    containerName = xelib.GetFileContainer(filePath);
                element[0].title = `Container: ${containerName}`;
                element[0].removeEventListener('mouseover', onMouseOver);
            };

            let onMouseOver = function() {
                if (tooltipTimeout) clearTimeout(tooltipTimeout);
                tooltipTimeout = setTimeout(getTitle, 500);
            };

            // event handlers
            if (scope.item.type !== 'folder') {
                element[0].addEventListener('mouseover', onMouseOver);

                scope.$on('$destroy', () => {
                    element[0].removeEventListener('mouseover', onMouseOver);
                });
            }
        }
    }
});
