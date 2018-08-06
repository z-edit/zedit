ngapp.service('modalService', function($rootScope) {
    let buildOptions = function(label, options) {
        let basePath = options.basePath || 'partials';
        return Object.assign({
            modal: label,
            templateUrl: `${basePath}/${label}Modal.html`,
            controller: `${label}ModalController`,
            class: `${label.underscore('-')}-modal`
        }, options);
    };

    this.init = function(scope) {
        let modalActive = function(modalName) {
            let opts = scope.modalOptions;
            return $rootScope.modalActive && opts && opts.modal === modalName;
        };

        scope.activateModal = function(modalName) {
            if (!modalActive(modalName)) scope.$emit('openModal', modalName);
        };

        scope.$on('openModal', function(e, label, options = {}) {
            scope.$evalAsync(function() {
                $rootScope.modalActive = true;
                scope.modalOptions = buildOptions(label, options);
                scope.showModal = true;
            });
            e.stopPropagation && e.stopPropagation();
        });

        scope.$on('closeModal', function(e) {
            scope.$applyAsync(function() {
                $rootScope.modalActive = false;
                scope.modalOptions = undefined;
                scope.showModal = false;
            });
            e.stopPropagation && e.stopPropagation();
        });
    };
});
