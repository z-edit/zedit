ngapp.service('recordViewDragDropService', function(errorService, nodeHelpers) {
    this.buildFunctions = function(scope) {
        // PRIVATE
        let isReference = function(node) {
            return node.value_type === xelib.vtReference;
        };

        let isReferenceArray = function(node, index) {
            if (node.value_type !== xelib.vtArray ||
                !node.handles[index]) return;
            let nodeIndex = scope.tree.indexOf(node);
            if (!node.expanded) scope.expandNode(node);
            return isReference(scope.tree[nodeIndex + 1]);
        };

        let canDropFromTreeView = function(dragData, node, index) {
            let draggedElementType = dragData.node.element_type;
            return draggedElementType === xelib.etMainRecord &&
                (isReference(node) || isReferenceArray(node, index));
        };

        let canDropFromRecordView = function(dragData, node, index) {
            let vt = node.value_type;
            if (dragData.node.value_type !== vt) return;
            if (dragData.node === node && dragData.index === index) return;
            if (vt === xelib.vtEnum || vt === xelib.vtFlags)
                return node.label === dragData.node.label;
            return true;
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

        let addReferenceMaster = function(ref, file) {
            xelib.WithHandle(xelib.GetElementFile(ref), function(master) {
                if (xelib.ElementEquals(file, master)) return;
                xelib.AddMaster(file, xelib.Name(master));
            });
        };

        let setReference = function(element, ref) {
            xelib.WithHandle(xelib.GetElementFile(element), function(file) {
                addReferenceMaster(ref, file);
                xelib.SetLinksTo(element, '', ref);
            });
        };

        let addReference = function(element, ref) {
            xelib.WithHandle(xelib.GetElementFile(element), function(file) {
                addReferenceMaster(ref, file);
                let newElement = xelib.AddElement(element, '.');
                xelib.SetLinksTo(newElement, '', ref);
            });
        };

        let setElement = function(src, dst) {
            xelib.WithHandle(xelib.GetElementFile(src), function(file) {
                xelib.AddRequiredMasters(dst, file);
            });
            xelib.SetElement(src, dst);
        };

        let dropFrom = {
            treeView: (node, src, dst) => {
                (isReference(node) ? setReference : addReference)(src, dst);
            },
            recordView: (node, src, dst) => setElement(src, dst)
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
                path = nodeHelpers.isFileNode(node) ? 'File Header' : '';
            scope.record = xelib.GetElementEx(node.handle, path);
        };

        scope.onCellDrag = function(node, index) {
            if (!node.handles[index - 1]) return;
            scope.$root.dragData = {
                source: 'recordView',
                node: node,
                index: index - 1
            };
            return true;
        };

        scope.onCellDragOver = function(node, index) {
            let dragData = scope.$root.dragData;
            if (index === 0 || !dragData) return;
            if (node.parent && node.parent.handles[index - 1] === 0) return;
            if (dragData.source === 'treeView') {
                return canDropFromTreeView(dragData, node, index - 1);
            } else if (dragData.source === 'recordView' ) {
                return canDropFromRecordView(dragData, node, index - 1);
            }
        };

        scope.onCellDrop = function(node, index) {
            let dragData = scope.$root.dragData;
            if (index === 0 || !dragData) return;
            let recordIndex = index - 1,
                targetRecord = scope.getRecord(recordIndex),
                cellHandle = getOrCreateCell(node, recordIndex),
                draggedElement = getDraggedElement(dragData);
            errorService.try(() => {
                dropFrom[dragData.source](node, cellHandle, draggedElement);
                scope.$root.$broadcast('recordUpdated', targetRecord);
                scope.reload();
            });
        };
    };
});
