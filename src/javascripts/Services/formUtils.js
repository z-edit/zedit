ngapp.service('formUtils', function () {
    this.unfocusModal = function (callback) {
        return function (e) {
            if (e.target.classList.contains("modal-container")) {
                callback(false);
            }
        }
    };
});