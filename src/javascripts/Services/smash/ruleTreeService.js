ngapp.service('ruleTreeService', function($timeout, settingsService, htmlHelpers) {
    let {resolveElement, findParent} = htmlHelpers;

    this.buildFunctions = function(scope, element) {
        let settings = settingsService.settings;

        // helper functions
        let reExpandNode = function(node) {
            let newNode = scope.getNewNode(node);
            if (!newNode) return;
            scope.getNodeData(newNode);
            scope.expandNode(newNode);
        };

        let reSelectNode = function(node) {
            let newNode = scope.getNewNode(node);
            if (newNode) scope.selectSingle(newNode, true, true, false);
        };

        let doDelete = function(confirmed = true) {
            if (!confirmed) return;
            scope.selectedNodes.forEach(scope.deleteRecord);
            scope.clearSelection(true);
            scope.reload();
        };

        // scope functions
        scope.reload = function() {
            if (!scope.tree) return;
            let scrollOffset = scope.viewElement.scrollTop,
                oldExpandedNodes = scope.tree.filter(node => node.expanded),
                oldSelectedNodes = scope.selectedNodes.slice();
            scope.clearSelection(true);
            scope.buildTree();
            oldExpandedNodes.forEach(n => reExpandNode(n));
            oldSelectedNodes.forEach(n => reSelectNode(n));
            scope.viewElement.scrollTop = scrollOffset;
        };

        scope.rebuildNode = function(node) {
            node.has_data = false;
            $timeout(() => scope.getNodeData(node));
        };

        scope.getRecordName = function(sig) {
            return `${sig} - ${scope.records[sig].name}`;
        };

        scope.buildRecordNode = sig => {
            let data = scope.records[sig];
            return {
                name: scope.getRecordName(sig),
                signature: sig,
                path: sig,
                state: scope.getNodeState(data),
                class: '',
                depth: 1,
                can_expand: data.elements.length > 0,
                data: data
            };
        };

        scope.recordsSelected = function() {
            if (!scope.selectedNodes.length) return;
            return scope.selectedNodes.find(node => {
                return node.depth > 1;
            }) === undefined;
        };

        scope.elementsSelected = function() {
            if (!scope.selectedNodes.length) return;
            return scope.selectedNodes.find(node => {
                return node.depth === 1;
            }) === undefined;
        };

        scope.getNewNode = function(oldNode) {
            return scope.tree.findByKey('path', oldNode.path);
        };

        scope.treeHasRecord = function(sig) {
            return scope.records.hasOwnProperty(sig);
        };

        scope.buildTree = function() {
            let signatures = Object.keys(scope.records);
            scope.tree = signatures.map(scope.buildRecordNode);
        };

        scope.getElementName = function(e) {
            if (!e.signatures) return e.name;
            return e.signatures.length > 1 ?
                `[${e.signatures.join('|')}] - ${e.name}` :
                `${e.signatures[0]} - ${e.name}`;
        };

        scope.buildNodes = function(node) {
            return node.data.elements.map(e => {
                let name = scope.getElementName(e);
                return {
                    name: name,
                    depth: node.depth + 1,
                    parent: node,
                    state: scope.getNodeState(e),
                    class: '',
                    groups: node.groups || node.data.groups,
                    path: [node.path, name].join('/'),
                    can_expand: Boolean(e.elements),
                    data: e
                };
            });
        };

        scope.deleteRecord = function(node) {
            delete scope.records[node.sig];
        };

        scope.removeRecords = function() {
            if (!scope.recordsSelected()) return;
            let shouldPrompt = settings.ruleView.promptOnDeletion;
            shouldPrompt ? scope.deletionPrompt().then(doDelete) : doDelete();
        };

        scope.getNodeData = function(node) {
            node.has_data = true;
            // TODO: resolve node group
        };

        scope.resolveElements = function() {
            scope.treeElement = resolveElement(element[0], '.nodes');
            scope.viewElement = findParent(element[0], el => {
                return el.classList.contains('rule-view');
            });
        };
    };
});
