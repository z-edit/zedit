ngapp.service('recordTreeElementService', function(errorService, settingsService) {
    this.buildFunctions = function(scope) {
        let uneditableValueTypes = [xelib.vtUnknown, xelib.vtArray, xelib.vtStruct],
            settings = settingsService.settings;

        // scope functions
        scope.getFileName = function(index) {
            return scope.columns[index].label;
        };

        scope.getRecord = function(index) {
            if (angular.isUndefined(index)) index = scope.focusedIndex - 1;
            return (index ? scope.overrides[index - 1] : scope.record)
        };

        scope.getParentHandle = function(node, index) {
            return node.parent ? node.parent.handles[index] : scope.getRecord(index);
        };

        scope.getElementArrayIndex = function(node, index) {
            let nodeIndex = scope.tree.indexOf(node),
                counter = 0,
                targetDepth = node.depth;
            for (let i = nodeIndex - 1; i > 0; i--) {
                let n = scope.tree[i];
                if (n.depth < targetDepth) return counter;
                if (n.depth === targetDepth && n.handles[index]) counter++;
            }
        };

        scope.getNewElementPath = function(node, index) {
            if (node.parent && node.parent.value_type === xelib.vtArray) {
                if (!node.is_sorted) return '.';
                return '^' + scope.getElementArrayIndex(node, index);
            } else {
                let n = node.label.indexOf(' - ');
                return n === 4 ? node.label.substr(0, 4) : node.label;
            }
        };

        scope.addElement = function(node, index) {
            errorService.try(function() {
                let handle = node.handles[index];
                if (handle) { // append element to array
                    if (node.value_type !== xelib.vtArray) return;
                    xelib.AddElement(handle, '.');
                } else { // create element in struct
                    handle = scope.getParentHandle(node, index);
                    if (!handle) return;
                    let path = scope.getNewElementPath(node, index);
                    xelib.AddElement(handle, path);
                }
                scope.reload(); // TODO? This is kind of greedy, but it's simple
                scope.$root.$broadcast('recordUpdated', scope.getRecord(index));
            });
        };

        scope.editElement = function(node, index) {
            if (uneditableValueTypes.includes(node.value_type)) return;
            if (!xelib.GetIsEditable(scope.getRecord(index - 1))) return;
            scope.$emit('openModal', 'editValue', {
                targetNode: node,
                targetIndex: index - 1,
                record: scope.record,
                overrides: scope.overrides
            });
        };

        scope.deleteElement = function(node) {
            errorService.try(function() {
                let handle = node.handles[scope.focusedIndex - 1];
                xelib.RemoveElement(handle);
                //xelib.Release(handle);
            });
        };

        scope.deletionPromptMessage = function() {
            let recordIndex = scope.focusedIndex - 1,
                recordName = xelib.Name(scope.getRecord(recordIndex)),
                fileName = scope.getFileName(recordIndex);
            if (scope.selectedNodes.length === 1) {
                let node = scope.selectedNodes[0],
                    path = xelib.LocalPath(node.handles[recordIndex]);
                return `Delete ${path} from ${recordName} in ${fileName}?`;
            } else {
                let message = `Delete ${scope.selectedNodes.length} elements from ${recordName} in ${fileName}?`;
                scope.selectedNodes.slice(0, 8).forEach(function(node) {
                    message += `\r\n  - ${xelib.LocalPath(node.handles[recordIndex])}`;
                });
                if (scope.selectedNiodes.length > 8) {
                    message += '\r\n  - ... etc.';
                }
                return message;
            }
        };

        scope.deletionPrompt = function() {
            return scope.$root.prompt({
                title: 'Delete elements',
                prompt: scope.deletionPromptMessage(),
                type: 'yesNo'
            });
        };

        scope.deleteElements = function() {
            if (!xelib.GetIsEditable(scope.getRecord())) return;
            let doDelete = function() {
                scope.selectedNodes.forEach(scope.deleteElement);
                scope.clearSelection(true);
                scope.reload(); // TODO? This is kind of greedy, but it's simple
            };
            if (settings.recordView.promptOnDeletion) {
                scope.deletionPrompt().then(function(result) {
                    if (result) doDelete();
                });
            } else {
                doDelete();
            }
        };

        scope.canPaste = function(asOverride) {
            return false;
        };
    }
});
