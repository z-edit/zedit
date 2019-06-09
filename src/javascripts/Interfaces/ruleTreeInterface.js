ngapp.factory('ruleTreeInterface', function($timeout, settingsService, htmlHelpers) {
    const UNCHECKED = 0;
    const CHECKED = 1;
    const INDETERMINATE = 2;

    let {resolveElement, findParent} = htmlHelpers;

    return function(scope, element) {
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

        let updateParentStates = function(parent) {
            if (!parent) return;
            scope.updateNodeState(parent);
            updateParentStates(parent.parent);
        };

        let setChildElementStates = function(element, process) {
            if (!element.elements) return;
            element.elements.forEach(e => {
                e.process = process;
                setChildElementStates(e, process);
            });
        };

        let isIndeterminate = function(foundStates) {
            return foundStates[2] || foundStates[0] && foundStates[1];
        };

        let getNodeState = function(element) {
            if (element.elements) return getStateFromChildren(element);
            return element.process ? CHECKED : UNCHECKED;
        };

        let getStateFromChildren = function(element) {
            let foundStates = [false, false, false];
            for (let i = 0; i < element.elements.length; i++) {
                foundStates[getNodeState(element.elements[i])] = true;
                if (isIndeterminate(foundStates)) return INDETERMINATE;
            }
            return foundStates.findIndex(n => n);
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
                    path: [node.path, name].join('/'), // TODO: use sort index?
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
            if (!node.groups) return;
            node.group = node.groups.findByKey('name', node.data.group);
        };

        scope.resolveElements = function() {
            scope.treeElement = resolveElement(element[0], '.nodes');
            scope.viewElement = findParent(element[0], el => {
                return el.classList.contains('rule-view');
            });
        };

        scope.getNodeState = getNodeState;

        // events
        scope.$on('updateNodeState', function(e, node) {
            node.state = scope.getNodeState(node.data);
            node.data.process = node.state > 0;
        });

        scope.$on('setNodeState', function(e, node, newState) {
            let process = Boolean(newState);
            setChildElementStates(node.data, process);
            node.data.process = process;
            updateParentStates(node.parent);
        });
    };
});
