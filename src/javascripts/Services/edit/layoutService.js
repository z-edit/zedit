ngapp.service('layoutService', function(viewFactory, randomService) {
    let service = this;

    let defaultLayouts = {
        'Edit': {
            "layout": "horizontal",
            "panes": [{
                "width": "45%",
                "tabs": ["treeView"]
            }, {
                "tabs": ["recordView", "referencedByView", "logView"]
            }]
        },
        'Smash': {
            "layout": "horizontal",
            "panes": [{
                "width": "45%",
                "tabs": ["smashTreeView", "smashRuleView"]
            }, {
                "tabs": ["smashRecordView", "logView"]
            }]
        }
    };

    this.buildPane = function(pane, parent) {
        pane.id = randomService.generateUniqueId();
        pane.parent = parent;
        if (pane.panes) pane.panes.forEach(p => service.buildPane(p, pane));
        if (!pane.tabs) return;
        pane.tabs = pane.tabs.map((viewName, index) => {
            let view = viewFactory.newView(viewName, index === 0);
            view.pane = pane;
            return view;
        });
    };

    this.buildDefaultLayout = function(key) {
        if (verbose) logger.info('buildDefaultLayout()');
        service.layout = angular.copy(defaultLayouts[key]);
        service.buildPane(service.layout);
        if (verbose) logger.info(`built ${service.layout.panes.length} panes`);
        return service.layout;
    };

    this.findView = function(callback) {
        return service.layout.panes.findNested('tabs', 'panes', callback);
    };

    this.switchToView = function(viewClass) {
        let view = service.findView(tab => tab.class === viewClass);
        if (!view) return;
        view.pane.tabs.forEach(tab => tab.active = tab === view);
    };

    this.newView = function(viewName, sourceView) {
        let s, p = sourceView.pane;
        while (p.parent) {
            s = p.parent.panes.find(pane => pane !== p);
            p = p.parent;
        }
        let view = viewFactory.newView(viewName, true);
        view.pane = s;
        s.tabs.forEach(tab => tab.active = false);
        s.tabs.push(view);
        return view;
    };
});
