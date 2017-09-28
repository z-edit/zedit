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
            items: '=?',
            depth: '=?'
        }
    }
});

ngapp.controller('apiItemsController', function() {
    let ctrl = this;
    ctrl.tintBg = (ctrl.depth || 0) % 2 === 0;

    let loadItems = function() {
        let basePath = ctrl.basePath || 'app/docs/development/apis',
            path = `${basePath}/${ctrl.path}`;
        return fh.loadResource(path, undefined) || fh.loadJsonFile(path);
    };

    if (ctrl.path) {
        ctrl.items = loadItems();
    }

    ctrl.items.forEach(function(item) {
        if (!item.type) item.type = 'function';
        item.isEvent = item.type === 'event';
    });
});
