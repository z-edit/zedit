ngapp.directive('contextMenu', function($timeout) {
    return {
        restrict: 'E',
        templateUrl: 'directives/contextMenu.html',
        scope: {
            items: '=',
            offset: '=?'
        },
        controller: 'contextMenuController',
        link: function(scope, element) {
            let e = element[0];
            if (scope.offset) {
                e.style.top = '0';
                e.style.left = '0';
                e.style.visibility = 'hidden';
                $timeout(function() {
                    if (scope.offset.top + e.offsetHeight > window.innerHeight) {
                        scope.offset.top = window.innerHeight - e.offsetHeight - 16;
                    }
                    if (scope.offset.left + e.offsetWidth > window.innerWidth) {
                        scope.offset.left = window.innerWidth - e.offsetWidth - 6;
                    }
                    e.style.top = scope.offset.top + 'px';
                    e.style.left = scope.offset.left + 'px';
                    e.style.visibility = 'visible';
                });
            } else {
                e.style.top = '0';
                e.style.left = '0';
                e.style.visibility = 'hidden';
                scope.offset = { top: -2, left: 16 };
                $timeout(function() {
                    // TODO: move up/down as necessary
                    // TODO: move to left side of parent if necessary
                    // TODO: enable scrolling if necessary
                    e.style.top = scope.offset.top + 'px';
                    e.style.left = scope.offset.left + 'px';
                    e.style.visibility = 'visible';
                });
            }
        }
    }
});

ngapp.controller('contextMenuController', function($scope, $element) {
    $scope.selectItem = function(item) {
        if (item.selected) return;
        item.selected = true;
    };

    $scope.deselectItem = function(e, item) {
        let container = $element[0],
            src = e.srcElement,
            depth = 0;
        while (src !== container) {
            src = src.parentElement;
            depth++;
        }
        if (depth > 4) return;
        item.selected = false;
    };

    $scope.clickItem = function(e, item) {
        e.stopImmediatePropagation();
        item.callback && item.callback();
        $scope.$emit('closeContextMenu')
    };
});