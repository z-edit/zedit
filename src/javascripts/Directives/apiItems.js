ngapp.directive('apiItems', function() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'directives/apiItems.html',
        controller: 'apiItemsController',
        controllerAs: 'vm',
        bindToController: {
            api: '@',
            namespace: '@',
            items: '=?',
            depth: '=?'
        }
    }
});

ngapp.controller('apiItemsController', function() {
    let ctrl = this;
    this.tintBg = (this.depth || 0) % 2 === 0;

    let loadItems = function() {
        let basePath = 'app/docs/development/apis',
            path = `${basePath}/${ctrl.api}/${ctrl.namespace}.json`;
        return fh.loadJsonFile(path);
    };

    if (!this.items) {
        let items = loadItems();
        items.forEach(function(item) {
            if (!item.type) item.type = 'function';
        });
        this.items = items;
    }
});
