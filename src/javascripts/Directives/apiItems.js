ngapp.directive('apiItems', function() {
    return {
        restrict: 'E',
        scope: {},
        templateUrl: 'directives/apiItems.html',
        controller: 'apiItemsController',
        controllerAs: 'vm',
        bindToController: {
            api: '@',
            basePath: '@',
            path: '@',
            module: '@',
            items: '=?',
            depth: '=?'
        }
    }
});

ngapp.controller('apiItemsController', function() {
    let ctrl = this;
    ctrl.tintBg = (ctrl.depth || 0) % 2 === 0;

    let getBasePath = function() {
        if (ctrl.basePath) return ctrl.basePath;
        if (ctrl.module) return `modules/${ctrl.module}/docs`;
        return 'app/docs/development/apis'
    };

    let loadItems = function() {
        let basePath = getBasePath(),
            path = `${basePath}/${ctrl.path}`;
        return fh.loadResource(path) || fh.loadJsonFile(path);
    };

    if (ctrl.path) ctrl.items = loadItems();

    ctrl.items.forEach(item => {
        if (!item.type) item.type = 'function';
        item.isEvent = item.type === 'event';
        item.isOptions = item.type === 'options';
    });
});
