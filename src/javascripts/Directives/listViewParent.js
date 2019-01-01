ngapp.directive('listViewParent', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            let el = element[0];
            el.tabIndex = 0;
            $timeout(() => el.focus());
        }
    }
});
