ngapp.service('appModeService', function($rootScope, $state, loadOrderService) {
    let service = this;

    let appModes = [{
        name: 'edit',
        loader: 'selectLoadOrder'
    }, {
        name: 'clean',
        loader: 'selectLoadOrder',
        confirm: function() {
            return confirm('The zClean application mode is still being developed.  Cleaning plugins may lead to CTDs.  Backups of any plugins cleaned with zClean will be saved to the zEdit Backups folder in your game\'s data directory.  Are you sure you want to proceed?');
        }
    }, {
        name: 'merge',
        loader: 'storeLoadOrder'
    }, {
        name: 'sort',
        loader: 'storeLoadOrder',
        hidden: true
    }, {
        name: 'smash',
        loader: 'storeLoadOrder',
        hidden: true
    }, {
        name: 'test',
        loader: 'storeLoadOrder',
        hidden: true
    }];

    let loaders = {
        storeLoadOrder: function() {
            loadOrderService.init();
            service.goToAppView();
        },
        selectLoadOrder: function(scope) {
            scope.$emit('setTitle', `${$rootScope.appMode} - Selecting Load Order`);
            scope.$emit('openModal', 'loadOrder', {}, true);
        }
    };

    this.getAppModes = function() {
        return appModes.filter(m => {
            return !m.hidden || env.show_hidden_appmodes;
        }).mapOnKey('name');
    };

    this.addAppMode = function(appMode) {
        appModes.push(appMode);
    };

    this.addLoader = function(name, loadFn) {
        loaders[name] = loadFn;
    };

    this.goToAppView = function() {
        $state.go(`base.${$rootScope.appMode}`);
    };

    this.selectAppMode = function(appModeName) {
        let appMode = appModes.findByKey('name', appModeName);
        if (appMode.confirm && !appMode.confirm()) return;
        $rootScope.appMode = appModeName;
        return true;
    };

    this.runLoader = function(scope) {
        let appMode = appModes.findByKey('name', $rootScope.appMode);
        loaders[appMode.loader](scope);
    };
});
