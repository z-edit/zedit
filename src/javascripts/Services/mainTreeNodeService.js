ngapp.service('mainTreeNodeService', function() {
    this.buildNodeFunctions = function(scope) {
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'];
        let caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'];

        scope.getNodeClass = function(node) {
            let classes = [];
            //if (xelib.GetModified(node.handle)) classes.push('modified');
            if (node.element_type === xelib.etMainRecord) {
                if (xelib.IsInjected(node.handle)) classes.push('injected');
                classes.push(ctClasses[xelib.ConflictThis(node.handle)]);
                classes.push(caClasses[xelib.ConflictAll(node.handle)]);
            }
            node.class = classes.join(' ');
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
            }
            scope.getNodeClass(node);
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