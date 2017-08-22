ngapp.directive('contextMenu', function($timeout) {
    return {
        restrict: 'E',
        templateUrl: 'directives/contextMenu.html',
        scope: {
            items: '=',
            offset: '=?'
        },
        link: function(scope, element) {
            scope.selectItem = function(item) {
                if (item.selected) return;
                scope.items.forEach((item) => item.selected = false);
                item.selected = true;
            };

            scope.clickItem = function(e, item) {
                e.stopPropagation();
                item.callback && item.callback();
                scope.$emit('closeContextMenu')
            };

            let e = element[0];
            if (scope.offset) {
                e.style.top = '0';
                e.style.left = '0';
                $timeout(function() {
                    if (scope.offset.top + e.offsetHeight > window.innerHeight) {
                        scope.offset.top = window.innerHeight - e.offsetHeight - 16;
                    }
                    if (scope.offset.left + e.offsetWidth > window.innerWidth) {
                        scope.offset.left = window.innerWidth - e.offsetWidth - 6;
                    }
                    e.style.top = scope.offset.top + 'px';
                    e.style.left = scope.offset.left + 'px';
                });
            } else {
                // TODO
            }
        }
    }
});