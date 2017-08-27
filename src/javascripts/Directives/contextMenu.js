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

ngapp.controller('contextMenuController', function($scope, $element, $timeout, hotkeyService, hotkeyFactory) {
    // scope and helper variables
    $scope.currentIndex = -1;
    let hotkeys = hotkeyFactory.contextMenuHotkeys(),
        table = $element[0].firstElementChild;

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onMenuKeyDown', hotkeys);

    // helper functions
    let getCurrentItem = function() {
        return $scope.items[$scope.currentIndex];
    };

    let decrementCurrentIndex = function() {
        if ($scope.currentIndex < 1) {
            $scope.currentIndex = $scope.items.length - 1;
        } else {
            $scope.currentIndex--;
        }
        let currentItem = getCurrentItem();
        if (currentItem.divider || currentItem.disabled) decrementCurrentIndex();
    };

    let incrementCurrentIndex = function() {
        if ($scope.currentIndex == $scope.items.length - 1) {
            $scope.currentIndex = 0;
        } else {
            $scope.currentIndex++;
        }
        let currentItem = getCurrentItem();
        if (currentItem.divider || currentItem.disabled) incrementCurrentIndex();
    };

    let getMenuDepth = function(src) {
        let container = $element[0],
            depth = 0;
        while (src !== container) {
            src = src.parentElement;
            depth++;
        }
        return depth;
    };

    // scope functions
    $scope.closeChildMenus = function() {
        $scope.items.forEach((item) => item.expanded = false);
    };

    $scope.selectItem = function(index) {
        $scope.closeChildMenus();
        $scope.currentIndex = index;
        if (index > -1) {
            let currentItem = getCurrentItem();
            $timeout(function() {
                if ($scope.currentIndex !== index) return;
                currentItem.expanded = true;
            }, 100);
        }
    };

    $scope.deselectItem = function(e, item) {
        if (getMenuDepth(e.srcElement) > 4) return;
        item.expanded = false;
        $scope.currentIndex = -1;
    };

    $scope.clickItem = function(e, item) {
        e.stopImmediatePropagation();
        if (!item) item = getCurrentItem();
        if (!item || item.disabled || !item.callback) return;
        item.callback();
        $scope.closeMenu();
    };

    $scope.handleRightArrow = function(e) {
        e.stopPropagation();
        if ($scope.currentIndex == -1) return;
        let currentItem = getCurrentItem();
        if (!currentItem.children) return;
        currentItem.expanded = true;
        $timeout(() =>$scope.$broadcast('focusFirstChild'));
    };

    $scope.handleLeftArrow = function(e) {
        e.stopPropagation();
        if (!$scope.nested) return;
        $scope.closeChildMenus();
        $scope.$emit('closeChildMenu');
    };

    $scope.handleUpArrow = function(e) {
        e.stopPropagation();
        decrementCurrentIndex();
    };

    $scope.handleDownArrow = function(e) {
        e.stopPropagation();
        incrementCurrentIndex();
    };

    $scope.closeMenu = () => $scope.$emit('closeContextMenu');

    $scope.$on('closeChildMenu', function(e) {
        if (e.targetScope === $scope) return;
        e.stopPropagation();
        getCurrentItem().expanded = false;
        table.focus();
    });

    $scope.$on('focusFirstChild', function(e) {
        if (e.targetScope === $scope) return;
        $scope.currentIndex = 0;
    });
});