ngapp.directive('assetItem', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/assetItem.html',
        link: function(scope, element, attrs) {
            scope.item.thumbnail = scope.item.type === 'folder' ?
                'images/folder.png' : 'images/file.png';


        }
    }
});
