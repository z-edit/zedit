ngapp.factory('typeToSearchInterface', function() {
    return function(scope) {
        let letterTimeout, queueLetter, letterQueue = '';

        // helper functions
        let getFirstSiblingIndex = function() {
            let startIndex = scope.tree.indexOf(scope.selectedNodes.last()),
                targetDepth = scope.tree[startIndex].depth,
                i = startIndex;
            for (; i >= 1; i--)
                if (scope.tree[i - 1].depth < targetDepth) break;
            return i;
        };

        let nodeMatches = function(node) {
            if (!node.has_data) scope.getNodeData(node);
            let i = node.element_type === xelib.etMainRecord ? 1 : 0,
                value = node.column_values[i].toLowerCase();
            if (node.element_type === xelib.etFile)
                return value.slice(5).startsWith(letterQueue);
            return value.startsWith(letterQueue);
        };

        let selectNextNode = function(index) {
            let targetDepth = scope.tree[index].depth;
            for (let i = index; i < scope.tree.length; i++) {
                let node = scope.tree[i];
                if (node.depth > targetDepth) continue;
                if (node.depth < targetDepth) break;
                if (nodeMatches(node)) {
                    scope.clearSelection();
                    scope.selectSingle(node);
                    return;
                }
            }
            if (targetDepth > 0) selectNextNode(index - 1);
        };

        scope.handleLetter = function(e) {
            if (e.keyCode < 65 || e.keyCode > 90) return;
            if (e.shiftKey || e.ctrlKey || e.altKey) return;
            clearTimeout(letterTimeout);
            letterTimeout = setTimeout(() => queueLetter = false, 500);
            if (!queueLetter) letterQueue = '';
            queueLetter = true;
            letterQueue += e.key;
            selectNextNode(getFirstSiblingIndex());
            e.stopImmediatePropagation();
        };
    };
});
