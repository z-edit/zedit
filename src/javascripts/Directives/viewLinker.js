ngapp.directive('viewLinker', function() {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/viewLinker.html',
        link: function(scope) {
            let canLink;

            scope.$on('toggleLinkMode', function(e, view) {
                scope.$applyAsync(() => scope.linking = view);
                canLink = false;
                if (!view) return;
                if (view === scope.view) {
                    scope.linkMessage = 'Being linked';
                    scope.linkClass = 'neutral';
                } else if (scope.view.isLinkedTo(view)) {
                    scope.linkMessage = 'Currently linked';
                    scope.linkClass = 'positive';
                } else if (scope.view.canLinkTo(view)) {
                    canLink = true;
                    scope.linkMessage = 'Can be linked to';
                    scope.linkClass = 'action';
                } else {
                    scope.linkMessage = 'Cannot be linked to';
                    scope.linkClass = 'negative';
                }
            });

            scope.$on('escapePressed', function() {
                scope.$applyAsync(() => scope.linking = false);
            });

            scope.link = function() {
                if (canLink) {
                    scope.linking.linkTo(scope.view);
                    scope.view.linkTo(scope.linking);
                } else if (scope.linking !== scope.view) {
                    return;
                }
                scope.$root.$broadcast('toggleLinkMode');
            };
        }
    }
});