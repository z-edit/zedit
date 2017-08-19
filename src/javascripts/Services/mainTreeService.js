ngapp.service('mainTreeService', function($timeout, mainTreeViewFactory) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'];
        let caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'];

        // helper functions
        let reExpandNode = function(node) {
            let newNode = scope.getNodeForElement(node.handle);
            if (newNode) {
                scope.getNodeData(newNode);
                scope.expandNode(newNode);
            }
        };

        let reSelectNode = function(node, scroll) {
            let newNode = scope.getNodeForElement(node.handle);
            if (newNode) {
                scope.selectSingle(newNode, true, true, false);
                if (scroll) scope.scrollToNode(newNode, true);
            }
        };

        // scope functions
        scope.getNodeClass = function(node) {
            let classes = [];
            //if (xelib.GetModified(node.handle)) classes.push('modified');
            if (node.element_type === xelib.etMainRecord && node.fid > 0) {
                if (xelib.IsInjected(node.handle)) classes.push('injected');
                let conflictData = xelib.GetRecordConflictData(node.handle);
                classes.push(caClasses[conflictData[0]]);
                classes.push(ctClasses[conflictData[1]]);
            }
            node.class = classes.join(' ');
        };

        scope.reloadNodes = function() {
            let start = Date.now(),
                oldExpandedNodes = scope.tree.filter((node) => { return node.expanded; }),
                oldSelectedNodes = scope.selectedNodes.slice(),
                oldTree = scope.tree;
            scope.clearSelection(true);
            scope.buildTree();
            oldExpandedNodes.forEach((n) => reExpandNode(n));
            oldSelectedNodes.forEach((n, i, a) => reSelectNode(n, i == a.length - 1));
            mainTreeViewFactory.releaseTree(oldTree);
            console.log(`Rebuilt tree (${scope.tree.length} nodes) in ${Date.now() - start}ms`);
        };

        scope.getCanExpand = function(node) {
            if (node.element_type === xelib.etMainRecord) {
                let childGroup = xelib.GetElement(node.handle, 'Child Group', true);
                node.can_expand = childGroup && xelib.ElementCount(childGroup) > 0;
            } else {
                node.can_expand = xelib.ElementCount(node.handle) > 0;
            }
        };

        scope.buildColumnValues = function(node) {
            node.column_values = scope.columns.map(function(column) {
                try {
                    return column.getData(node, xelib);
                } catch (x) {
                    console.log(x);
                    return { value: '' };
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
            scope.getCanExpand(node);
            scope.buildColumnValues(node);
        };

        scope.buildNode = function(handle, depth) {
            return {
                handle: handle,
                depth: depth + 1
            }
        };

        scope.buildNodes = function(node) {
            let path = node.element_type === xelib.etMainRecord ? 'Child Group' : '';
            return xelib.GetElements(node.handle, path, true).map(function(handle) {
                return scope.buildNode(handle, node.depth);
            });
        };
    };
});