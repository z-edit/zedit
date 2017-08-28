ngapp.directive('listView', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/listView.html',
        transclude: true,
        scope: false,
        controller: 'listViewController',
        link: function(scope, element, attrs) {
            scope.reorderable = attrs.hasOwnProperty('reorderable');
            scope.items = scope.$eval(attrs.items);
            scope.listClass = attrs.listClass;
            scope.listType = attrs.listType;
        }
    }
});

ngapp.controller('listViewController', function($scope) {
    // helper variables
    let prevIndex = undefined;

    // helper functions
    let removeClasses = function(element) {
        element.classList.remove('insert-after');
        element.classList.remove('insert-before');
    };

    // scope functions
    $scope.clearSelection = function() {
        $scope.items.forEach((item) => item.selected = false);
        prevIndex = undefined;
        $scope.$emit('selectionChanged');
    };

    $scope.onItemClick = function(e, item, index) {
        if (e.shiftKey && prevIndex !== undefined) {
            let start = Math.min(index, prevIndex),
                end = Math.max(index, prevIndex);
            if (!e.ctrlKey) $scope.clearSelection();
            for (var i = start; i <= end; i++) {
                $scope.items[i].selected = true;
            }
        } else if (e.ctrlKey) {
            item.selected = !item.selected;
            prevIndex = index;
        } else {
            $scope.clearSelection();
            item.selected = true;
            prevIndex = index;
        }
        e.stopImmediatePropagation();
    };

    $scope.onKeyPress = function(e) {
        if (e.keyCode == 32) { // toggle selected items on space
            $scope.items.forEach(function(item) {
                if (item.selected) item.active = !item.active;
            });
            $scope.$emit('selectionChanged');
        } else if (e.keyCode == 27) { // clear selection on escape
            $scope.clearSelection();
        } else if (e.keyCode == 13) { // default action on enter
            $scope.defaultAction && $scope.defaultAction();
        } else {
            return;
        }
        e.stopImmediatePropagation();
        e.preventDefault();
    };

    $scope.onItemDrag = function(index) {
        if (!$scope.reorderable) return;
        $scope.$root.dragData = {
            source: $scope.listType,
            index: index
        };
        return true;
    };

    $scope.onItemDragOver = function(e) {
        if (!$scope.reorderable) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== $scope.listType) return;
        let after = e.clientX > e.target.offsetHeight / 2;
        e.target.classList[after ? 'add' : 'remove']('insert-after');
        e.target.classList[after ? 'remove' : 'add']('insert-before');
        return true;
    };

    $scope.onItemDragLeave = (e) => removeClasses(e.target);

    $scope.onItemDrop = function(e, index) {
        if (!$scope.reorderable) return;
        let dragData = $scope.$root.dragData;
        if (!dragData || dragData.source !== $scope.listType) return;
        removeClasses(e.target);
        if (dragData.index === index) return;
        let after = e.clientX > e.target.offsetHeight / 2,
            movedItem = $scope.items.splice(dragData.index, 1)[0];
        $scope.items.splice(index + after, 0, movedItem);
        return true;
    };

    // event handling
    $scope.$on('clearSelection', $scope.clearSelection);
    $scope.$on('keyPress', (e, event) => $scope.onKeyPress(event));
});