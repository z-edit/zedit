ngapp.controller('recordViewController', function($scope, $element, $timeout, htmlHelpers, treeService, recordViewService, recordViewElementService, recordViewDragDropService, nodeSelectionService, nodeColumnService, hotkeyService, contextMenuService, contextMenuFactory) {
    // link view to scope
    $scope.view = $scope.$parent.tab;
    $scope.view.scope = $scope;

    // verbose logging
    if (verbose) logger.info(`Rendering recordView`);

    // helper/scope variables
    let viewsToLink = ['tree-view', 'referenced-by-view', 'filter-view'];
    $scope.overrides = [];
    $scope.contextMenuItems = contextMenuFactory.recordViewItems;

    // inherited functions
    treeService.buildFunctions($scope, $element);
    recordViewService.buildFunctions($scope);
    recordViewElementService.buildFunctions($scope);
    recordViewDragDropService.buildFunctions($scope);
    nodeSelectionService.buildFunctions($scope, false, true);
    nodeColumnService.buildFunctions($scope, '.record-view', false, true);
    hotkeyService.buildOnKeyDown($scope, 'onTreeKeyDown', 'recordView');

    // helper functions
    let fixTopBorder = function() {
        if ($scope.showAddressBar || $scope.showSearchBar) {
            $scope.columnsElement.classList.remove('top-border');
        } else {
            $scope.columnsElement.classList.add('top-border');
        }
    };

    // scope functions
    $scope.showContextMenu = function(e) {
        if ($scope.focusedIndex === 0) return;
        contextMenuService.showContextMenu($scope, e);
    };

    $scope.toggleAddressBar = function(visible) {
        $scope.showAddressBar = visible;
        fixTopBorder();
        if (visible) {
            $timeout($scope.focusAddressInput, 50);
        } else if ($scope.treeElement) {
            $scope.treeElement.focus();
        }
    };

    $scope.focusAddressInput = function() {
        let addressInput = htmlHelpers.resolveElement($scope.tabView, 'record-address-bar/input');
        if (addressInput) addressInput.focus();
    };

    $scope.onScroll = function(e) {
        $scope.columnsElement.scrollLeft = e.currentTarget.scrollLeft;
    };

    $scope.onNodeDoubleClick = function(e, node) {
        if (e.srcElement && e.srcElement.classList.contains('expand-node')) return;
        if (node.can_expand) $scope.toggleNode(null, node);
    };

    $scope.onCellDoubleClick = function(e, node, index) {
        if (index === 0 || node.cells[index].editing) return;
        if (!node.handles[index - 1]) {
            $scope.addElement(node, index);
            $timeout(() => $scope.editElement(node, index), 50);
        } else {
            $scope.editElement(node, index);
        }
        e.stopImmediatePropagation();
    };

    $scope.onCellMouseDown = function(e, node, index) {
        if (e.ctrlKey && index > 0 && node.value_type === xelib.vtReference) {
            let element = node.handles[index - 1];
            let ref = element && xelib.GetLinksTo(element, '');
            if (ref) $scope.record = ref;
        } else {
            let oldIndex = $scope.focusedIndex;
            $scope.focusedIndex = index;
            if (oldIndex !== index) {
                $timeout($scope.updateNodeLabels);
            } else if (node.selected && e.button === 0) {
                $timeout(() => {
                    if (!!$scope.$root.dragData || !node.selected ||
                        $scope.focusedIndex !== index) return;
                    $scope.editElementInline(node, index);
                }, 250);
            }
        }
    };

    $scope.onCellMouseOver = function(e, node, index) {
        if (index === 0 || node.value_type !== xelib.vtReference) return;
        $scope.refCell = node.cells[index];
        $scope.refCell.underline = e.ctrlKey;
    };

    $scope.onCellMouseLeave = function() {
        if (!$scope.refCell) return;
        $scope.refCell.underline = false;
        delete $scope.refCell;
    };

    $scope.handleEnter = function(e) {
        let node = $scope.lastSelectedNode();
        if (e.shiftKey) {
            $scope.editElementInline(node, $scope.focusedIndex);
        } else {
            $scope.onNodeDoubleClick(e, node);
            $scope.onCellDoubleClick(e, node, $scope.focusedIndex);
        }
        e.stopImmediatePropagation();
    };

    $scope.handleInsert = function(e) {
        let node = $scope.lastSelectedNode();
        $scope.addElement(node, $scope.focusedIndex - 1);
        e.stopImmediatePropagation();
    };

    $scope.releaseHandles = function(oldValue) {
        xelib.Release(oldValue);
        if ($scope.virtualNodes) xelib.ReleaseNodes($scope.virtualNodes);
        $scope.overrides.forEach(xelib.Release);
        $scope.overrides = [];
    };

    // event handling
    $scope.$on('setRecord', function(e, record) {
        $scope.record = record;
        e.stopPropagation();
    });
    $scope.$on('recordUpdated', function(e, record) {
        if ($scope.record === record || $scope.overrides.includes(record)) {
            $scope.updateNodes();
        }
    });
    $scope.$on('nodeUpdated', $scope.reload);
    $scope.$on('reloadGUI', function() {
        if (!$scope.record) return;
        if (!xelib.HasElement($scope.record)) {
            $scope.releaseHandles($scope.record);
            $scope.record = undefined;
        } else {
            $scope.overrides.forEach(xelib.Release);
            $scope.overrides = xelib.GetOverrides($scope.record);
            $scope.buildColumns();
            $scope.reload();
        }
    });
    $scope.$on('nodeAdded', function() {
        if (!$scope.record) return;
        if (!xelib.GetFormID($scope.record)) $scope.reload();
    });


    $scope.$on('controlKeyPressed', function() {
        if (!$scope.refCell) return;
        $scope.$applyAsync(() => $scope.refCell.underline = true);
    });

    $scope.$on('controlKeyReleased', function() {
        if (!$scope.refCell) return;
        $scope.$applyAsync(() => $scope.refCell.underline = false);
    });

    // reload when hide unassigned/non-conflicting is toggled
    $scope.$watch('hideUnassigned', $scope.reload);
    $scope.$watch('hideNonConflicting', $scope.reload);

    // initialization
    $scope.$watch('record', function(newValue, oldValue) {
        if (oldValue === newValue) return;
        if (oldValue) $scope.releaseHandles(oldValue);
        if (!newValue) {
            $scope.view.label = 'Record View';
            return;
        }
        if (!xelib.IsMaster(newValue)) {
            $scope.record = xelib.GetMasterRecord(newValue);
        } else {
            $scope.view.label = xelib.Name($scope.record);
            $scope.selectedNodes = [];
            $scope.focusedIndex = -1;
            $scope.buildColumns();
            $scope.buildTree();
            $scope.syncWithReferencedByView($scope.record);
            $scope.$broadcast('recordChanged');
            $timeout(() => {
                $scope.resolveElements();
                $scope.treeElement.scrollTop = 0;
            }, 100);
        }
    });

    $scope.showAddressBar = true;
    $scope.autoExpand = true;
    $timeout(() => viewsToLink.forEach($scope.linkToView), 100);
});
