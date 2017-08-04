export default function(ngapp) {
    ngapp.service('listViewFactory', function () {
        this.build = function(scope, collectionName, defaultActionName) {
            // helper variables
            let collection = scope[collectionName];
            let defaultAction = scope[defaultActionName];

            // initialize scope variables
            scope.prevIndex = undefined;

            // scope functions
            scope.clearSelection = function() {
                collection.forEach(function(item) {
                    item.selected = false;
                });
                scope.prevIndex = undefined;
            };

            scope.select = function(e, item, index) {
                if (e.shiftKey && scope.prevIndex !== undefined) {
                    var start = Math.min(index, scope.prevIndex);
                    var end = Math.max(index, scope.prevIndex);
                    for (var i = start; i <= end; i++) {
                        collection[i].selected = true;
                    }
                } else if (e.ctrlKey) {
                    item.selected = !item.selected;
                } else {
                    scope.clearSelection();
                    item.selected = true;
                }
                scope.prevIndex = index;
                e.stopPropagation();
            };

            scope.onKeyPress = function(e) {
                // toggle selected items if space pressed
                if (e.keyCode == 32) {
                    collection.forEach(function(item) {
                        if (item.selected) item.active = !item.active;
                    });
                    scope.updateIndexes();
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
};
