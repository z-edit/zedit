ngapp.service('listViewFactory', function () {
    this.build = function(scope, collectionName, defaultActionName) {
        // helper variables
        let collection = scope[collectionName];
        let defaultAction = scope[defaultActionName];
        let prevIndex = undefined;

        // scope functions
        scope.clearSelection = function() {
            collection.forEach(function(item) {
                item.selected = false;
            });
            prevIndex = undefined;
        };

        scope.select = function(e, item, index) {
            if (e.shiftKey && prevIndex !== undefined) {
                let start = Math.min(index, prevIndex),
                    end = Math.max(index, prevIndex);
                if (!e.ctrlKey) scope.clearSelection();
                for (var i = start; i <= end; i++) {
                    collection[i].selected = true;
                }
            } else if (e.ctrlKey) {
                item.selected = !item.selected;
                prevIndex = index;
            } else {
                scope.clearSelection();
                item.selected = true;
                prevIndex = index;
            }
            e.stopImmediatePropagation();
        };

        scope.onKeyPress = function(e) {
            // toggle selected items if space pressed
            if (e.keyCode == 32) {
                collection.forEach(function(item) {
                    if (item.selected) item.active = !item.active;
                });
                scope.updateIndexes && scope.updateIndexes();
            }
            // clear selection on escape
            else if (e.keyCode == 27) {
                scope.clearSelection();
            }
            // load plugins on enter
            else if (e.keyCode == 13) {
                defaultAction();
            } else {
                return;
            }
            e.stopImmediatePropagation();
            e.preventDefault();
        };
    };
});