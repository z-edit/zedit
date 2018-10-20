ngapp.directive('listView', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/listView.html',
        transclude: true,
        ctrl: {},
        bindToController: {
            items: '=',
            defaultAction: '=?',
            filters: '=?',
            dragType: '@'
        },
        controllerAs: 'ctrl',
        controller: 'listViewController'
    }
});

ngapp.controller('listViewController', function($scope, $timeout, $element, hotkeyService, contextMenuService, contextMenuFactory, htmlHelpers) {
    // initialization
    let ctrl = this;

    ctrl.parent = htmlHelpers.findParent($element[0], el => {
        return el.hasAttribute('list-view-parent');
    });

    ctrl.listItems = $element[0].firstElementChild;

    // helper variables
    let prevIndex = -1,
        eventListeners = {
            click: e => $scope.$apply(() => ctrl.onParentClick(e)),
            keydown: e => $scope.$apply(() => {
                ctrl.items && ctrl.onKeyDown(e)
            })
        };

    // helper functions
    let removeClasses = function(element) {
        element.classList.remove('insert-after');
        element.classList.remove('insert-before');
    };

    let toggleEventListeners = function(add) {
        if (!ctrl.parent) return;
        let method = `${add ? 'add' : 'remove'}EventListener`;
        Object.keys(eventListeners).forEach(key => {
            ctrl.parent[method](key, eventListeners[key]);
        });
    };

    // inherited variables and functions
    $scope.contextMenuItems = contextMenuFactory.checkboxListItems;
    hotkeyService.buildOnKeyDown(ctrl, 'onKeyDown', 'listView');
    hotkeyService.buildOnKeyDown(ctrl, 'onFilterKeyDown', 'listViewFilter');

    // ctrl functions
    ctrl.showContextMenu = function(e) {
        contextMenuService.showContextMenu($scope, e);
    };

    ctrl.clearSelection = function(resetPrevIndex) {
        ctrl.items.forEach(item => item.selected = false);
        if (resetPrevIndex) prevIndex = -1;
    };

    ctrl.selectAll = function() {
        ctrl.items.forEach(item => item.selected = true);
        prevIndex = ctrl.items.length - 1;
    };

    ctrl.toggleSelected = function(targetValue) {
        let selectedItems = ctrl.items.filter(function(item) {
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

    ctrl.scrollTo = function(index) {
        let child = ctrl.listItems.children[index],
            offsetTop = child.offsetTop,
            offsetBottom = offsetTop + child.offsetHeight,
            topBound = ctrl.listItems.scrollTop,
            bottomBound = topBound + ctrl.listItems.offsetHeight;
        if (offsetTop < topBound) { // scroll up
            ctrl.listItems.scrollTop = offsetTop;
        } else if (offsetBottom > bottomBound) { // scroll down
            ctrl.listItems.scrollTop += offsetBottom - bottomBound;
        }
    };

    ctrl.selectItem = function(e, index, scroll = true) {
        let item = ctrl.items[index];
        if (scroll) ctrl.scrollTo(index);
        if (e.shiftKey && prevIndex > -1) {
            let start = Math.min(index, prevIndex),
                end = Math.max(index, prevIndex);
            if (!e.ctrlKey) ctrl.clearSelection();
            for (let i = start; i <= end; i++) {
                ctrl.items[i].selected = true;
            }
        } else if (e.ctrlKey) {
            item.selected = !item.selected;
            prevIndex = index;
        } else {
            ctrl.clearSelection(true);
            item.selected = true;
            prevIndex = index;
        }
    };

    // event handlers
    ctrl.handleEnter = function() {
        ctrl.defaultAction && ctrl.defaultAction();
    };

    ctrl.handleSpace = function(e) {
        // Ctrl+Space enables, Shift+Space disables, Space toggles
        let targetValue = e.ctrlKey ? true : (e.shiftKey ? false : undefined);
        ctrl.toggleSelected(targetValue);
    };

    ctrl.handleUpArrow = function() {
        prevIndex = (prevIndex < 1 ? ctrl.items.length : prevIndex) - 1;
        ctrl.selectItem({}, prevIndex);
    };

    ctrl.handleDownArrow = function() {
        prevIndex = (prevIndex >= ctrl.items.length - 1 ? -1 : prevIndex) + 1;
        ctrl.selectItem({}, prevIndex);
    };

    ctrl.onParentClick = function(e) {
        if (!ctrl.items) return;
        let inListView = htmlHelpers.findParent(e.srcElement, node => {
            return node === $element[0];
        });
        if (!inListView) ctrl.clearSelection(true);
    };

    ctrl.onItemMouseDown = function(e, index) {
        let item = ctrl.items[index];
        if (e.button !== 2 || !item.selected) ctrl.selectItem(e, index);
        if (e.button === 2) ctrl.showContextMenu(e);
    };

    ctrl.onItemDrag = function(index) {
        if (!ctrl.dragType) return;
        $scope.$root.$broadcast('startDrag', {
            source: ctrl.dragType,
            index: index,
            getItem: () => ctrl.items.splice(index, 1)[0]
        });
        return true;
    };

    ctrl.onItemDragOver = function(e, index) {
        if (!ctrl.dragType) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== ctrl.dragType) return;
        if (dragData.index === index) return true;
        let after = e.offsetY > (e.target.offsetHeight / 2);
        e.target.classList[after ? 'add' : 'remove']('insert-after');
        e.target.classList[after ? 'remove' : 'add']('insert-before');
        return true;
    };

    ctrl.onPlaceholderDragOver = function() {
        let dragData = $scope.$root.dragData;
        return dragData && dragData.source === ctrl.dragType;
    };

    ctrl.onItemDragLeave = (e) => removeClasses(e.target);

    ctrl.onItemDrop = function(e, index) {
        if (!ctrl.dragType) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== ctrl.dragType) return;
        if (dragData.index === index) return;
        let after = e.offsetY > (e.target.offsetHeight / 2),
            lengthBefore = ctrl.items.length,
            movedItem = dragData.getItem(),
            adjust = lengthBefore > ctrl.items.length && index > dragData.index;
        removeClasses(e.target);
        ctrl.items.splice(index + after - adjust, 0, movedItem);
        prevIndex = index + after - adjust;
        $scope.$emit('itemsReordered');
        return true;
    };

    ctrl.onPlaceholderDrop = function() {
        let dragData = ctrl.$root.dragData;
        if (!dragData || dragData.source !== ctrl.dragType) return;
        ctrl.items.push(dragData.getItem());
        $scope.$emit('itemsReordered');
        return true;
    };

    ctrl.toggleFilter = function(visible) {
        if (!ctrl.filters) return;
        let filters = ctrl.filters.filter(f => f.modes.select);
        if (!filters.length) return;
        ctrl.filterItems = visible && filters.map(f => ({
            label: f.label,
            text: '',
            filter: f.filter
        }));
        if (!visible) ctrl.parent.focus();
        return true;
    };

    ctrl.filterChanged = function() {
        if (!ctrl.filterItems) return;
        let index = ctrl.items.findIndex(item => {
            return ctrl.filterItems.reduce((b, f) => {
                return b && f.filter(item, f.text);
            }, true);
        });
        if (index === -1) return;
        ctrl.selectItem({}, index);
    };

    $scope.$on('destroy', () => toggleEventListeners(false));

    $scope.$on('startDrag', function() {
        $scope.$applyAsync(() => ctrl.dragging = true);
    });

    $scope.$on('stopDrag', function() {
        $scope.$applyAsync(() => ctrl.dragging = false);
    });

    // initialization
    toggleEventListeners(true);
});
