ngapp.service('viewLinkingService', function() {
    this.buildFunctions = function(view, linkKey, allowLinkTo) {
        let getLinkKey = function(className) {
            return `linked${className.toPascalCase()}`;
        };

        view.isLinkedTo = function(otherView) {
            return otherView[linkKey] === view;
        };

        view.canLinkTo = function(otherView) {
            return allowLinkTo.includes(otherView.class) && !view[linkKey];
        };

        view.linkTo = function(otherView) {
            if (!allowLinkTo.includes(otherView.class)) return;
            otherView[linkKey] = view;
            view[getLinkKey(otherView.class)] = otherView;
        };

        view.unlinkAll = function() {
            allowLinkTo.forEach(function(viewClass) {
                let otherLinkKey = getLinkKey(viewClass),
                    linkedView = view[otherLinkKey];
                if (!linkedView) return;
                delete linkedView[linkKey];
                delete view[otherLinkKey];
            });
        };
    };
});