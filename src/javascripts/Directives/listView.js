ngapp.directive('listView', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/listView.html',
        transclude: true,
        scope: {
            items: '=',
            defaultAction: '=?',
            dragType: '@'
        },
        controller: 'listViewController'
    }
});

ngapp.controller('listViewController', function($scope, $timeout, $element, hotkeyService, formUtils, htmlHelpers, contextMenuFactory, hotkeyFactory) {
    // helper variables
    let prevIndex = -1;

    // helper functions
    let removeClasses = function(element) {
        element.classList.remove('insert-after');
        element.classList.remove('insert-before');
    };

    // inherited variables and functions
    let hotkeys = hotkeyFactory.listViewHotkeys();
    $scope.contextMenuItems = contextMenuFactory.checkboxListItems;
    formUtils.buildShowContextMenuFunction($scope);
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', hotkeys);

    // scope functions
    $scope.clearSelection = function(resetPrevIndex ) {
        $scope.items.forEach((item) => item.selected = false);
        if (resetPrevIndex) prevIndex = -1;
    };

    $scope.selectAll = function() {
        $scope.items.forEach((item) => item.selected = true);
        prevIndex = $scope.items.length - 1;
    };

    $scope.toggleSelected = function(targetValue) {
        let selectedItems = $scope.items.filter(function(item) {
                return item.selected && !item.disabled;
            }),
            toggle = angular.isUndefined(targetValue),
            newActiveValues = selectedItems.map(function(item) {
                return toggle ? !item.active : targetValue;
            });
        selectedItems.forEach(function(item, index) {
            if (item.active !== newActiveValues[index]) {
                item.active = newActiveValues[index];
                $scope.$emit('itemToggled', item);
            }
        });
    };

    $scope.selectItem = function(e, index) {
        let item = $scope.items[index];
        if (e.shiftKey && prevIndex > -1) {
            let start = Math.min(index, prevIndex),
                end = Math.max(index, prevIndex);
            if (!e.ctrlKey) $scope.clearSelection();
            for (let i = start; i <= end; i++) {
                $scope.items[i].selected = true;
            }
        } else if (e.ctrlKey) {
            item.selected = !item.selected;
            prevIndex = index;
        } else {
            $scope.clearSelection(true);
            item.selected = true;
            prevIndex = index;
        }
    };

    // event handlers
    $scope.handleEnter = function() {
        $scope.defaultAction && $scope.defaultAction();
    };

    $scope.handleSpace = function(e) {
        // Ctrl+Space enables, Shift+Space disables, Space toggles
        let targetValue = e.ctrlKey ? true : (e.shiftKey ? false : undefined);
        $scope.toggleSelected(targetValue);
    };

    $scope.handleUpArrow = function() {
        prevIndex = (prevIndex < 1 ? $scope.items.length : prevIndex) - 1;
        $scope.selectItem({}, prevIndex);
    };

    $scope.handleDownArrow = function() {
        prevIndex = (prevIndex >= $scope.items.length - 1 ? -1 : prevIndex) + 1;
        $scope.selectItem({}, prevIndex);
    };

    $scope.onItemMouseDown = function(e, index) {
        let item = $scope.items[index];
        if (e.button != 2 || !item.selected) $scope.selectItem(e, index);
        if (e.button == 2) $scope.showContextMenu(e);
    };

    $scope.onParentClick = function(e) {
        let parentListView = htmlHelpers.findParent(e.srcElement, function(parentNode) {
            return parentNode === $element[0];
        });
        if (!parentListView) $scope.clearSelection(true);
    };

    $scope.onItemDrag = function(index) {
        if (!$scope.dragType) return;
        $scope.$root.dragData = {
            source: $scope.dragType,
            index: index
        };
        return true;
    };

    $scope.onItemDragOver = function(e, index) {
        if (!$scope.dragType) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== $scope.dragType) return;
        if (dragData.index === index) return true;
        let after = e.offsetY > (e.target.offsetHeight / 2);
        e.target.classList[after ? 'add' : 'remove']('insert-after');
        e.target.classList[after ? 'remove' : 'add']('insert-before');
        return true;
    };

    $scope.onItemDragLeave = function(e) {
        removeClasses(e.target);
    };

    $scope.onItemDrop = function(e, index) {
        if (!$scope.dragType) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== $scope.dragType) return;
        if (dragData.index === index) return;
        let after = e.offsetY > (e.target.offsetHeight / 2),
            adjust = index > dragData.index,
            movedItem = $scope.items.splice(dragData.index, 1)[0];
        removeClasses(e.target);
        $scope.items.splice(index + after - adjust, 0, movedItem);
        prevIndex = index + after - adjust;
        $scope.$emit('itemsReordered');
        return true;
    };

    // angular event handlers
    $scope.$on('parentClick', (e, event) => $scope.onParentClick(event));
    $scope.$on('keyDown', (e, event) => $scope.onKeyDown(event));
});