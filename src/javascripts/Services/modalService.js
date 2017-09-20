ngapp.service('modalService', function() {
    this.buildOptions = function(label, options) {
        let basePath = options.basePath || 'partials';
        return Object.assign({
            templateUrl: `${basePath}/${label}Modal.html`,
            controller: `${label}ModalController`,
            class: `${label.underscore('-')}-modal`
        }, options);
    };
});