ngapp.service('modalService', function() {
    this.buildOptions = function(label, options) {
        let basePath = options.basePath || 'partials';
        return Object.assign({
            templateUrl: `${basePath}/${label}Modal.html`,
            controller: `${label}ModalController`,
            class: `${label.underscore('-')}-modal`
        }, options);
    };

    this.initTabsModal = function(scope) {
        // helper functions
        let selectTab = function(tab) {
            scope.tabs.forEach((tab) => tab.selected = false);
            scope.currentTab = tab;
            scope.currentTab.selected = true;
        };

        // scope functions
        scope.onTabClick = function(e, tab) {
            e.stopPropagation();
            if (tab === scope.currentTab) return;
            selectTab(tab);
        };

        // initialization
        selectTab(scope.tabs[0]);
    };
});
