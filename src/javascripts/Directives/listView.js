ngapp.directive('listView', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/listView.html',
        transclude: true,
        scope: {
            items: '=',
            defaultAction: '=?',
            filters: '=?',
            dragType: '@',
            disableDrag: '=?'
        },
        controller: 'listViewController'
    }
});

ngapp.controller('listViewController', function($scope, $timeout, $element, hotkeyService, contextMenuService, htmlHelpers) {
    // initialization
    $scope.parent = htmlHelpers.findParent($element[0], el => {
        return el.hasAttribute('list-view-parent');
    });

    $scope.listItems = $element[0].firstElementChild;

    // helper variables
    let prevIndex = -1,
        eventListeners = {
            click: e => $scope.$apply(() => $scope.onParentClick(e)),
            keydown: e => $scope.$apply(() => {
                $scope.items && $scope.onKeyDown(e)
            })
        };

    // helper functions
    let removeClasses = function(element) {
        element.classList.remove('insert-after');
        element.classList.remove('insert-before');
    };

    let toggleEventListeners = function(add) {
        if (!$scope.parent) return;
        let method = `${add ? 'add' : 'remove'}EventListener`;
        Object.keys(eventListeners).forEach(key => {
            $scope.parent[method](key, eventListeners[key]);
        });
    };

    let onSameItem = function(dragData, e, index) {
        return e.target === dragData.element &&
            index === dragData.index;
    };

    // inherited variables and functions
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'listView');
    hotkeyService.buildOnKeyDown($scope, 'onFilterKeyDown', 'listViewFilter');
    contextMenuService.buildFunctions($scope, 'listView');

    // scope functions
    $scope.clearSelection = function(resetPrevIndex) {
        $scope.items.forEach(item => item.selected = false);
        if (resetPrevIndex) prevIndex = -1;
    };

    $scope.selectAll = function() {
        $scope.items.forEach(item => item.selected = true);
        prevIndex = $scope.items.length - 1;
    };

    $scope.toggleSelected = function(targetValue) {
        let selectedItems = $scope.items.filter(item => {
                return item.selected && !item.disabled;
            }),
            toggle = angular.isUndefined(targetValue),
            newActiveValues = selectedItems.map(item => {
                return toggle ? !item.active : targetValue;
            });
        selectedItems.forEach((item, index) => {
            if (item.active !== newActiveValues[index]) {
                item.active = newActiveValues[index];
                $scope.$emit('itemToggled', item);
            }
        });
    };

    $scope.scrollTo = function(index) {
        let child = $scope.listItems.children[index],
            offsetTop = child.offsetTop,
            offsetBottom = offsetTop + child.offsetHeight,
            topBound = $scope.listItems.scrollTop,
            bottomBound = topBound + $scope.listItems.offsetHeight;
        if (offsetTop < topBound) { // scroll up
            $scope.listItems.scrollTop = offsetTop;
        } else if (offsetBottom > bottomBound) { // scroll down
            $scope.listItems.scrollTop += offsetBottom - bottomBound;
        }
    };

    $scope.selectItem = function(e, index, scroll = true) {
        let item = $scope.items[index];
        if (scroll) $scope.scrollTo(index);
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

    $scope.onParentClick = function(e) {
        if (!$scope.items) return;
        let inListView = htmlHelpers.findParent(e.srcElement, node => {
            return node === $element[0];
        });
        if (!inListView) $scope.clearSelection(true);
    };

    $scope.onItemMouseDown = function(e, index) {
        let item = $scope.items[index];
        if (e.button !== 2 || !item.selected) $scope.selectItem(e, index);
        if (e.button === 2) $scope.showContextMenu(e);
    };

    $scope.onItemDrag = function(e, index) {
        if (!$scope.dragType || $scope.disableDrag) return;
        $scope.$root.$broadcast('startDrag', {
            element: e.target,
            source: $scope.dragType,
            index: index,
            getItem: () => $scope.items.splice(index, 1)[0]
        });
        return true;
    };

    $scope.onItemDragOver = function(e, index) {
        if (!$scope.dragType || $scope.disableDrag) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== $scope.dragType) return;
        if (onSameItem(dragData, e, index)) return true;
        let after = e.offsetY > (e.target.offsetHeight / 2);
        e.target.classList[after ? 'add' : 'remove']('insert-after');
        e.target.classList[after ? 'remove' : 'add']('insert-before');
        return true;
    };

    $scope.onPlaceholderDragOver = function() {
        let dragData = $scope.$root.dragData;
        return dragData && dragData.source === $scope.dragType;
    };

    $scope.onItemDragLeave = (e) => removeClasses(e.target);

    $scope.onItemDrop = function(e, index) {
        if (!$scope.dragType || $scope.disableDrag) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== $scope.dragType) return;
        if (onSameItem(dragData, e, index)) return;
        let after = e.offsetY > (e.target.offsetHeight / 2),
            lengthBefore = $scope.items.length,
            movedItem = dragData.getItem(),
            adjust = lengthBefore > $scope.items.length && index > dragData.index;
        removeClasses(e.target);
        $scope.items.splice(index + after - adjust, 0, movedItem);
        prevIndex = index + after - adjust;
        $scope.$emit('itemsReordered');
        return true;
    };

    $scope.onPlaceholderDrop = function() {
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== $scope.dragType) return;
        $scope.items.push(dragData.getItem());
        $scope.$emit('itemsReordered');
        return true;
    };

    $scope.toggleFilter = function(visible) {
        if (!$scope.filters) return;
        let filters = $scope.filters.filter(f => f.modes.select);
        if (!filters.length) return;
        $scope.filterItems = visible && filters.map(f => ({
            label: f.label,
            text: '',
            filter: f.filter
        }));
        if (!visible) $scope.parent.focus();
        return true;
    };

    $scope.filterChanged = function() {
        if (!$scope.filterItems) return;
        let index = $scope.items.findIndex(item => {
            return $scope.filterItems.reduce((b, f) => {
                return b && f.filter(item, f.text);
            }, true);
        });
        if (index === -1) return;
        $scope.selectItem({}, index);
    };

    $scope.$on('destroy', () => toggleEventListeners(false));

    $scope.$on('startDrag', function() {
        $scope.$applyAsync(() => $scope.dragging = true);
    });

    $scope.$on('stopDrag', function() {
        $scope.$applyAsync(() => $scope.dragging = false);
    });

    // initialization
    toggleEventListeners(true);
});
