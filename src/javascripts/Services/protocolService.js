ngapp.service('protocolService', function($document) {
    this.init = function(scope) {
        let handleHttpLink = (href) => fh.openUrl(href);

        let handleDocsLink = function(href) {
            scope.activateModal('help');
            scope.$broadcast('helpNavigateTo', href.substr(7));
        };

        let protocolHandlers = {
            http: handleHttpLink,
            https: handleHttpLink,
            docs: handleDocsLink
        };

        let handleLink = function(href) {
            let protocol = href.match(/([^:]+)/)[1];
            let handler = protocolHandlers[protocol];
            handler && handler(href);
            return !!handler;
        };

        // handle link protocols properly
        $document.bind('click', function(event) {
            if (event.target.tagName !== 'A') return;
            if (handleLink(event.target.href)) event.preventDefault();
        });
    };
});
