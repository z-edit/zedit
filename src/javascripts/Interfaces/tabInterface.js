ngapp.factory('tabInterface', function() {
    return function(scope) {
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
