ngapp.service('formUtils', function ($timeout, contextMenuService) {
    this.unfocusModal = function (callback) {
        return function (e) {
            if (e.target.classList.contains("modal-container")) {
                callback(false);
            }
        }
    };

    this.buildToggleModalFunction = function($scope, modalName) {
        $scope['toggle' + modalName] = function(visible) {
            if ($scope.$root.modalActive && visible) return;
            $scope.$applyAsync(() => $scope['show' + modalName] = visible);
            $scope.$root.modalActive = visible;
        };
    };

    this.buildShowContextMenuFunction = function(scope) {
        scope.showContextMenu = function(e) {
            let offset = { top: e.clientY, left: e.clientX},
                items = scope.contextMenuItems,
                menuItems = contextMenuService.buildMenuItems(scope, items);
            $timeout(() => scope.$emit('openContextMenu', offset, menuItems));
        };
    }
});