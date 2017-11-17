ngapp.service('referencedByViewService', function($timeout, layoutService, settingsService, xelibService, referencedByViewFactory, objectUtils) {
    this.buildFunctions = function(scope) {
        // inherited functions
        scope.releaseTree = referencedByViewFactory.releaseTree;

        scope.buildTree = function() {
            scope.tree = xelib.GetReferencedBy(scope.record).map(function(handle) {
                return scope.buildNode(handle);
            });
            scope.sortTree();
        };

        // PUBLIC
        scope.onDragOver = function() {
            let dragData = scope.$root.dragData;
            if (dragData && dragData.source === 'treeView') return true;
        };

        scope.onDrop = function() {
            let dragData = scope.$root.dragData;
            if (!dragData || dragData.source !== 'treeView') return;
            let node = dragData.node;
            scope.open(xelib.GetElementEx(node.handle, ''));
        };

        scope.toggleSort = function(column) {
            if (!column.canSort) return;
            if (scope.sort.column !== column.label) {
                scope.sort.column = column.label;
                scope.sort.reverse = false;
            } else {
                scope.sort.reverse = !scope.sort.reverse;
            }
            scope.sortTree();
        };

        scope.sortTree = function() {
            const colIndex = scope.allColumns.findIndex(column => {
                return column.label === scope.sort.column;
            });
            if (colIndex === -1) return;
            scope.tree.sort((a, b) => {
                if (!a.has_data) scope.getNodeData(a);
                if (!b.has_data) scope.getNodeData(b);
                return a.column_values[colIndex] > b.column_values[colIndex];
            });
            if (scope.sort.reverse) {
                scope.tree.reverse();
            }
        }

        scope.linkToRecordView = function() {
            let recordView = layoutService.findView(function(view) {
                return view.class === 'record-view' && !view.linkedReferencedByView;
            });
            if (!recordView) {
                scope.linkToTreeView();
                return;
            }
            scope.view.linkTo(recordView);
            recordView.linkTo(scope.view);
        };

        scope.linkToTreeView = function() {
            let treeView = layoutService.findView(function(view) {
                return view.class === 'tree-view' && !view.linkedReferencedByView;
            });
            if (!treeView) return;
            scope.view.linkTo(treeView);
            treeView.linkTo(scope.view);
        };
    }
});
