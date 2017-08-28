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
            scope.itemTemplateUrl = attrs.itemTemplateUrl;
        }
    }
});

ngapp.controller('listViewController', function($scope) {
    // helper variables
    let prevIndex = undefined;

    // scope functions
    $scope.clearSelection = function() {
        $scope.items.forEach((item) => item.selected = false);
        prevIndex = undefined;
    };

    $scope.select = function(e, item, index) {
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
        // toggle selected items if space pressed
        if (e.keyCode == 32) {
            $scope.items.forEach(function(item) {
                if (item.selected) item.active = !item.active;
            });
            $scope.updateIndexes && $scope.updateIndexes();
        }
        // clear selection on escape
        else if (e.keyCode == 27) {
            $scope.clearSelection();
        }
        // load plugins on enter
        else if (e.keyCode == 13) {
            $scope.defaultAction();
        } else {
            return;
        }
        e.stopImmediatePropagation();
        e.preventDefault();
    };
});