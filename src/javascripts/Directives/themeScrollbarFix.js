ngapp.directive('themeScrollbarFix', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            let el = element[0], oldOverflowY;
            scope.$on('themeChanged', function() {
                oldOverflowY = el.style['overflow-y'];
                el.style['overflow-y'] = 'hidden';
                $timeout(() => el.style['overflow-y'] = oldOverflowY);
            });
        }
    }
});
