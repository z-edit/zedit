ngapp.directive('contextMenu', function($timeout, htmlHelpers) {
    return {
        restrict: 'E',
        templateUrl: 'directives/contextMenu.html',
        scope: {
            items: '=',
            offset: '=?',
            nested: '=?'
        },
        controller: 'contextMenuController',
        link: function(scope, element) {
            let e = element[0],
                table = e.firstElementChild;
            if (!scope.offset) {
                scope.offset = { top: e.offsetTop - 8, left: e.offsetLeft };
            }
            e.style.top = '0';
            e.style.left = '0';
            e.style.visibility = 'hidden';
            $timeout(function() {
                if (e.offsetHeight > window.innerHeight) {
                    scope.offset.top = 45;
                    scope.showScroll = true;
                    e.style['max-height'] = window.innerHeight - 50 + 'px';
                } else if (scope.offset.top + e.offsetHeight > window.innerHeight) {
                    scope.offset.top = window.innerHeight - e.offsetHeight - 16;
                }
                if (scope.offset.left + e.offsetWidth > window.innerWidth) {
                    if (scope.nested) {
                        let parentMenu = htmlHelpers.findParent(e, function(element) {
                            return element.tagName === 'CONTEXT-MENU';
                        });
                        scope.offset.left -= parentMenu.offsetWidth + e.offsetWidth;
                    } else {
                        scope.offset.left = window.innerWidth - e.offsetWidth - 6;
                    }
                }
                e.style.top = scope.offset.top + 'px';
                e.style.left = scope.offset.left + 'px';
                e.style.visibility = 'visible';
                table.focus();
            });
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