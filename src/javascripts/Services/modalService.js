ngapp.service('modalService', function() {
    this.buildOptions = function(label, options) {
        let basePath = options.basePath || 'partials';
        return Object.assign({
            templateUrl: `${basePath}/${label}Modal.html`,
            controller: `${label}ModalController`,
            class: `${label.underscore('-')}-modal`
        }, options);
    };

    this.buildUnfocusModalFunction = function(scope, callbackName) {
        scope.unfocusModal = function(e) {
            if (!e.target.classList.contains('modal-container')) return;
            callbackName ? scope[callbackName]() : scope.$emit('closeModal');
        };
    }
});