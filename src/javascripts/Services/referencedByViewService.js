ngapp.service('referencedByViewService', function($timeout, layoutService, settingsService, xelibService, referencedByViewFactory, objectUtils) {
    this.buildFunctions = function(scope) {
        // inherited functions
        scope.releaseTree = referencedByViewFactory.releaseTree;

        scope.buildTree = function() {
            xelib.SetSortMode(scope.sort.column, scope.sort.reverse);
            scope.tree = xelib.GetReferencedBy(scope.record).map(function(handle) {
                return scope.buildNode(handle);
            });
        };

        // PUBLIC
        scope.onDragOver = function() {
            let dragData = scope.$root.dragData;
            if (dragData && dragData.source === 'treeView') return true;
        };

        scope.onDrop = function() {
            let dragData = scope.$root.dragData;
            if (!dragData || dragData.source !== 'treeView') return;
            let node = dragData.node,
                path = node.element_type === xelib.etFile ? 'File Header' : '';
            scope.record = xelib.GetElementEx(node.handle, path);
            scope.syncWithLinkedViews(scope.record);
        };

        scope.linkToTreeView = function() {
            let treeView = layoutService.findView(function(view) {
                return view.class === 'tree-view' && !view.linkedReferencedByView;
            });
            if (!treeView) return;
            scope.view.linkTo(treeView);
            treeView.linkTo(scope.view);
        };

        scope.syncWithLinkedViews = function(record) {
            if (scope.view.linkedTreeView && scope.view.linkedTreeView.linkedRecordView) {
                scope.view.linkedTreeView.linkedRecordView.scope.record = record;
            }
        };
    }
});
