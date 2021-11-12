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

ngapp.filter('listViewFilter', function() {
    return function(items, filterItems, filterOptions) {
        if (!filterOptions.onlyShowMatches) return items;
        if (!filterItems) return items;
        return items.filter(item => {
            return filterItems.reduce((b, f) => {
                return b && f.filter(item, f.text);
            }, true);
        });
    }
});

ngapp.controller('listViewController', function($scope, $timeout, $element, hotkeyService, contextMenuService, contextMenuFactory, htmlHelpers) {
    // initialization
    $scope.parent = htmlHelpers.findParent($element[0], el => {
        return el.hasAttribute('list-view-parent');
    });

    $scope.listItems = $element[0].firstElementChild;
    $scope.filteredItems = $scope.items;
    $scope.filterOptions = {
      onlyShowMatches: false
    };

    // helper variables
    let firstFilteredIndex = -1,
        eventListeners = {
            click: e => $scope.$apply(() => $scope.onParentClick(e)),
            keydown: e => $scope.$apply(() => {
                $scope.items && $scope.onKeyDown(e)
            })
        };

    const prevIndex = {
        _value: -1,
        _filteredValue: -1,
        get value() {
            return this._value;
        },
        get filteredValue() {
            return this._filteredValue;
        },
        set filteredValue(i) {
            this._filteredValue = i;
            this._value = i > -1 ? $scope.filteredItems[i].index : -1;
        }
    }

    $scope.$watchCollection("filteredItems", function() {
        if ($scope.filterOptions.onlyShowMatches) {
            prevIndex.filteredValue = toFilteredIndex(prevIndex.value);

            // When only matches are shown, the first index is trivially 0.
            firstFilteredIndex = $scope.filteredItems.length > 0 ? 0 : -1;
        } else {
            prevIndex.filteredValue = prevIndex.value;
        }

        // Can't know if the change happened cause of onlyShowMatches or
        // filteredItems, so call it always.
        $scope.filterChanged();
    });

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

    let checkFilters = function(item) {
        return $scope.filterItems.reduce((b, f) => {
            return b && f.filter(item, f.text);
        }, true);
    }

    let toFilteredIndex = function(index) {
        return $scope.filteredItems.findIndex(item => {
            return item.index === index;
        });
    }

    // inherited variables and functions
    $scope.contextMenuItems = contextMenuFactory.checkboxListItems;
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'listView');
    hotkeyService.buildOnKeyDown($scope, 'onFilterKeyDown', 'listViewFilter');

    // scope functions
    $scope.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.clearSelection = function(resetPrevIndex) {
        $scope.items.forEach(item => item.selected = false);
        if (resetPrevIndex) prevIndex.filteredValue = -1;
    };

    $scope.selectAll = function() {
        if ($scope.filterOptions.onlyShowMatches) $scope.clearSelection(false);
        $scope.items.forEach(item => item.selected = true);
        prevIndex.filteredValue = $scope.filteredItems.length - 1;
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
        let item = $scope.filteredItems[index];
        if (scroll) $scope.scrollTo(index);
        if (e.shiftKey && prevIndex.filteredValue > -1) {
            let start = Math.min(index, prevIndex.filteredValue),
                end = Math.max(index, prevIndex.filteredValue);
            if (!e.ctrlKey) $scope.clearSelection();
            for (let i = start; i <= end; i++) {
                $scope.filteredItems[i].selected = true;
            }
        } else if (e.ctrlKey) {
            item.selected = !item.selected;
            prevIndex.filteredValue = index;
        } else {
            $scope.clearSelection(true);
            item.selected = true;
            prevIndex.filteredValue = index;
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
        prevIndex.filteredValue = (prevIndex.filteredValue < 1 ? $scope.filteredItems.length : prevIndex.filteredValue) - 1;
        $scope.selectItem({}, prevIndex.filteredValue);
    };

    $scope.handleDownArrow = function() {
        prevIndex.filteredValue = (prevIndex.filteredValue >= $scope.filteredItems.length - 1 ? -1 : prevIndex.filteredValue) + 1;
        $scope.selectItem({}, prevIndex.filteredValue);
    };

    $scope.onParentClick = function(e) {
        if (!$scope.items) return;
        let inListView = htmlHelpers.findParent(e.srcElement, node => {
            return node === $element[0];
        });
        if (!inListView) $scope.clearSelection(true);
    };

    $scope.onItemMouseDown = function(e, index) {
        let item = $scope.filteredItems[index];
        if (e.button !== 2 || !item.selected) $scope.selectItem(e, index);
        if (e.button === 2) $scope.showContextMenu(e);
    };

    $scope.onItemDrag = function(e, index) {
        if (!$scope.dragType || $scope.disableDrag) return;
        $scope.$root.$broadcast('startDrag', {
            element: e.target,
            source: $scope.dragType,
            index: index,
            getItem: () => $scope.items.splice($scope.filteredItems[index].index, 1)[0]
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
            lengthBefore = $scope.filteredItems.length,
            movedItem = dragData.getItem(),
            adjust = lengthBefore > $scope.filteredItems.length && index > dragData.index;
        removeClasses(e.target);
        $scope.items.splice($scope.filteredItems[index + after - adjust].index, 0, movedItem);
        prevIndex.filteredValue = index + after - adjust;
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
        let prevMatches = false;

        if ($scope.filterOptions.onlyShowMatches) {
            // When only matches are shown, the first index is trivially 0.
            firstFilteredIndex = $scope.filteredItems.length > 0 ? 0 : -1;

            if (!$scope.filterItems || firstFilteredIndex === -1) return;

            prevMatches = prevIndex.filteredValue !== -1;
        } else {
            if (!$scope.filterItems) return;

            firstFilteredIndex = $scope.filteredItems.findIndex(checkFilters);
            if (firstFilteredIndex === -1) return;

            // If the first index is the previous index, then it's already known
            // that the previous index is a match.
            prevMatches = firstFilteredIndex === prevIndex.value || (prevIndex.value !== -1 && checkFilters($scope.items[prevIndex.value]));
        }

        // Don't select the item if the previous selection already matches,
        // or if the found index is already selected.
        if (!prevMatches && !$scope.filteredItems[firstFilteredIndex].selected) {
            $scope.selectItem({}, firstFilteredIndex); // This also calls scrollTo.
        } else {
            // Even if the selection remains, it may have gone out of view if
            // onlyShowMatches was toggled.
            $scope.scrollTo(firstFilteredIndex);
        }
    };

    $scope.selectNextFiltered = function() {
        if (!$scope.filterItems || $scope.filteredItems.length === 0 || firstFilteredIndex === -1) return;

        if ($scope.filterOptions.onlyShowMatches) {
            // The next index doesn't need to be searched for;
            // it's trivially +1 since only matching items are being shown.
            $scope.handleDownArrow();
            return;
        }

        let index = $scope.filteredItems.findIndex((item, i) => {
            // Find the next index such that all filters are satisfied.
            // Skip items that are at/before the previously selected index.
            return i > prevIndex.filteredValue && checkFilters(item);
        });

        // The end has been reached; cycle back to the start.
        if (index === -1) index = firstFilteredIndex;

        $scope.selectItem({}, index);
    }

    $scope.onOnlyShowMatchesChanged = function() {
        // This executes before the filter is updated so that the
        // firstFilteredIndex is still valid.
        if (!$scope.filterOptions.onlyShowMatches) {
            if (firstFilteredIndex > -1) {
                firstFilteredIndex = $scope.filteredItems[firstFilteredIndex].index;
            }
        }
    }

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
