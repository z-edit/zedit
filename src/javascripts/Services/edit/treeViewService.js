ngapp.service('treeViewService', function($timeout, treeViewFactory, settingsService, nodeHelpers, errorService) {
    this.buildFunctions = function(scope) {
        // helper variables
        let ctClasses = ['ct-unknown', 'ct-ignored', 'ct-not-defined', 'ct-identical-to-master', 'ct-only-one', 'ct-hidden-by-mod-group', 'ct-master', 'ct-conflict-benign', 'ct-override', 'ct-identical-to-master-wins-conflict', 'ct-conflict-wins', 'ct-conflict-loses'],
            caClasses = ['ca-unknown', 'ca-only-one', 'ca-no-conflict', 'ca-conflict-benign', 'ca-override', 'ca-conflict', 'ca-conflict-critical'],
            settings = settingsService.settings;

        // helper functions
        let getElements = function(id, path) {
            return xelib.GetElements(id, path, true, scope.view.filter);
        };

        let hideFileHeaders = function() {
            return !settings.treeView.showFileHeaders;
        };

        // scope functions
        scope.buildColumns = function() {
            if (verbose) logger.info('buildColumns()');
            scope.columns = scope.allColumns.filterOnKey('enabled');
            let width = scope.columns.reduce((width, c) => {
                if (c.width) width += parseInt(c.width.slice(0, -1));
                return width;
            }, 0);
            if (width > 100) {
                let defaultWidth = Math.floor(100/scope.columns.length) + '%',
                    sizableColumns = scope.columns.slice(0, -1);
                sizableColumns.forEach(column => column.width = defaultWidth);
            }
            scope.resizeColumns();
        };

        scope.buildTree = function() {
            if (verbose) logger.info('scope.buildTree called');
            xelib.SetSortMode(scope.sort.column, scope.sort.reverse);
            scope.tree = getElements(0, '').map(function(handle) {
                return scope.buildNode(handle, -1);
            });
        };

        scope.rebuildNode = function(node) {
            let index = scope.tree.indexOf(node);
            scope.tree.splice(index, 1, {
                handle: node.handle,
                depth: node.depth
            });
        };

        scope.rebuildChildren = function(node) {
            if (!node.expanded) return;
            scope.collapseNode(node);
            scope.expandNode(node);
        };

        scope.resolveNode = function(path) {
            let node = undefined,
                handle = 0;
            path.split('\\').forEach(function(part) {
                let nextHandle = xelib.GetElementEx(handle, `${part}`);
                if (handle > 0) xelib.Release(handle);
                handle = nextHandle;
                if (part !== 'Child Group') {
                    node = scope.getNodeForElement(handle);
                    if (!node) throw scope.resolveNodeError(path, part);
                    if (!node.has_data) scope.getNodeData(node);
                    if (!node.expanded) scope.expandNode(node);
                }
            });
            return node;
        };

        scope.navigateToElement = function(handle, open) {
            if (handle === 0) return;
            let node = scope.resolveNode(xelib.LongPath(handle));
            if (node) {
                scope.clearSelection(true);
                scope.selectSingle(node, true, true, false);
                if (open) scope.open(node);
                $timeout(() => scope.scrollToNode(node, true));
            }
        };

        scope.nodeHasHandle = function(node, handle) {
            return node.handle === handle;
        };

        scope.getNewNode = function(node) {
            return scope.getNodeForElement(node.handle);
        };

        scope.setParentsModified = function(handle) {
            let node, element = xelib.GetElementEx(handle);
            while (!node) {
                node = scope.getNodeForElement(element);
                if (node) continue;
                let container = xelib.GetContainer(element);
                xelib.Release(element);
                if (!container) return;
                element = container;
            }
            scope.setNodeModified(node);
            xelib.Release(element);
        };

        scope.getNodeClass = function(node) {
            let classes = [];
            if (verbose) logger.info('- xelib.GetIsModified');
            if (xelib.GetIsModified(node.handle)) classes.push('modified');
            if (nodeHelpers.isRecordNode(node) && node.fid > 0) {
                if (xelib.IsInjected(node.handle)) classes.push('injected');
                let conflictData = xelib.GetRecordConflictData(node.handle);
                classes.push(caClasses[conflictData[0]]);
                classes.push(ctClasses[conflictData[1]]);
            }
            node.class = classes.join(' ');
        };

        scope.getCanExpand = function(node) {
            if (nodeHelpers.isRecordNode(node)) {
                let childGroup = xelib.GetElement(node.handle, 'Child Group');
                node.can_expand = childGroup && xelib.ElementCount(childGroup) > 0;
            } else {
                node.can_expand = xelib.ElementCount(node.handle) >
                    +(nodeHelpers.isFileNode(node) && hideFileHeaders());
            }
        };

        scope.buildColumnValues = function(node) {
            node.column_values = scope.columns.map(function(column) {
                let v = { value : '' };
                errorService.try(() => v = column.getData(node, xelib));
                return v;
            }).trimFalsy();
        };

        scope.getNodeData = function(node) {
            if (verbose) logger.info(`getNodeData({handle: ${node.handle}})`);
            node.element_type = xelib.ElementType(node.handle);
            node.has_data = true;
            if (nodeHelpers.isRecordNode(node)) {
                node.kac = xelib.GetElement(node.handle, '[0]');
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
            let path = nodeHelpers.isRecordNode(node) ? 'Child Group' : '',
                elements = getElements(node.handle, path);
            if (nodeHelpers.isFileNode(node) && hideFileHeaders()) {
                let index = elements.findIndex(function(element) {
                    return xelib.Signature(element) === 'TES4';
                });
                if (index > -1) elements.splice(index, 1);
            }
            return elements.map((e) => { return scope.buildNode(e, node.depth); });
        };
    };
});
