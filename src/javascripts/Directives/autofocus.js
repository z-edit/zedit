ngapp.directive('autofocus', function($timeout) {
    return {
        restrict: 'A',
        link: function(scope, element) {
            $timeout(() => element[0].focus());
        }
    }
});
