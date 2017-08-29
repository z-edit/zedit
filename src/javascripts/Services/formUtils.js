ngapp.service('formUtils', function () {
    this.unfocusModal = function (callback) {
        return function (e) {
            if (e.target.classList.contains("modal-container")) {
                callback(false);
            }
        }
    };

    this.buildToggleModalFunction = function($scope, modalName) {
        $scope['toggle' + modalName] = function(visible) {
            $scope.$applyAsync(() => $scope['show' + modalName] = visible);
            $scope.$root.modalActive = visible;
        };
    };
});