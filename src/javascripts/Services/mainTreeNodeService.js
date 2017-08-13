ngapp.service('mainTreeNodeService', function() {
    this.buildNodeFunctions = function(scope) {
        scope.getNodeStatus = function(node) {
            let status = {
                modified: false //xelib.GetModified(handle)
            };
            if (node.element_type === xelib.etMainRecord) {
                status.override = xelib.IsOverride(node.handle);
                status.injected = xelib.IsInjected(node.handle);
                status.conflict = 'ctNoConflict'; //xelib.ConflictThis(node.handle);
            }
            node.status = status;
        };

        scope.getChildrenCount = function(node) {
            if (node.element_type === xelib.etMainRecord) {
                let childGroup = xelib.GetElement(node.handle, 'Child Group', true);
                node.children_count = childGroup && xelib.ElementCount(childGroup);
            } else {
                node.children_count = xelib.ElementCount(node.handle);
            }
        };

        scope.buildColumnValues = function(node) {
            node.column_values = scope.columns.map(function(column) {
                try {
                    return column.getData(node, xelib) || "";
                } catch (x) {
                    console.log(x);
                    return "";
                }
            }).trimFalsy();
        };

        scope.getNodeData = function(node) {
            node.element_type = xelib.ElementType(node.handle);
            node.has_data = true;
            if (node.element_type === xelib.etMainRecord) {
                node.fid = xelib.GetFormID(node.handle);
                node.is_record = true;
            }
            scope.getNodeStatus(node);
            scope.getChildrenCount(node);
            scope.buildColumnValues(node);
            return node;
        };

        scope.buildNode = function(handle, depth) {
            return {
                handle: handle,
                depth: depth + 1
            }
        };

        scope.buildNodes = function(node) {
            let path = node.element_type === xelib.etMainRecord ? 'Child Group' : '';
            return xelib.GetElements(node.handle, path).map(function(handle) {
                return scope.buildNode(handle, node.depth);
            });
        };
    };
});