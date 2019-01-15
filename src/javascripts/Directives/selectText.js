ngapp.directive('selectText', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            $timeout(() => {
                element[0].focus();
                element[0].select();
            });
        }
    }
});
