ngapp.service('recordTreeDragDropService', function(errorService) {
    this.buildFunctions = function(scope) {
        scope.onDragOver = function() {
            let dragData = scope.$root.dragData;
            if (dragData && dragData.source === 'mainTreeView') return true;
        };

        scope.onDrop = function() {
            let dragData = scope.$root.dragData;
            if (!dragData || dragData.source !== 'mainTreeView') return;
            let node = dragData.node,
                path = node.element_type === xelib.etFile ? 'File Header' : '';
            scope.record = xelib.GetElementEx(node.handle, path);
        };

        scope.onCellDrag = function(node, index) {
            if (!node.handles[index - 1]) return;
            scope.$root.dragData = {
                source: 'recordTreeView',
                node: node,
                index: index - 1
            };
            return true;
        };

        let canDropFromTreeView = function(dragData, node) {
            let draggedElementType = dragData.node.element_type,
                isReference = node.value_type === xelib.vtReference;
            return isReference && draggedElementType === xelib.etMainRecord;
        };

        let canDropFromRecordView = function(dragData, node) {
            let vt = node.value_type;
            if (dragData.node.value_type !== vt) return;
            if (vt === xelib.vtEnum || vt === xelib.vtFlags)
                return node.label === dragData.node.label;
            return true;
        };

        scope.onCellDragOver = function(node, index) {
            let dragData = scope.$root.dragData;
            if (index === 0 || !dragData) return;
            if (node.parent && !node.parent.handles[index - 1] > 0) return;
            if (dragData && dragData.source === 'mainTreeView') {
                return canDropFromTreeView(dragData, node);
            } else if (dragData && dragData.source === 'recordTreeView' ) {
                return canDropFromRecordView(dragData, node);
            }
        };

        let setReference = function(element, ref) {
            xelib.WithHandle(xelib.GetElementFile(element), function(file) {
                xelib.WithHandle(xelib.GetElementFile(ref), function(masterFile) {
                    xelib.AddMaster(file, xelib.Name(masterFile));
                });
                xelib.SetLinksTo(element, ref);
            });
        };

        let getDraggedElement = function(dragData) {
            return dragData.node.handle || dragData.node.handles[dragData.index];
        };

        let getOrCreateCell = function(node, recordIndex) {
            let cellHandle = node.handles[recordIndex];
            if (!cellHandle) {
                let parentElement = scope.getParentHandle(node, recordIndex),
                    path = scope.getNewElementPath(node, recordIndex);
                cellHandle = xelib.AddElement(parentElement, path);
            }
            return cellHandle;
        };

        scope.onCellDrop = function(node, index) {
            let dragData = scope.$root.dragData;
            if (index === 0 || !dragData) return;
            let recordIndex = index - 1,
                cellHandle = getOrCreateCell(node, recordIndex),
                draggedElement = getDraggedElement(dragData);
            errorService.try(function() {
                if (dragData.source === 'mainTreeView') {
                    setReference(cellHandle, draggedElement);
                } else {
                    xelib.SetElement(cellHandle, draggedElement);
                }
                scope.reload();
            });
        };
    };
});
