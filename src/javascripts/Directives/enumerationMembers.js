ngapp.directive('enumerationMembers', function() {
    return {
        restrict: 'E',
        templateUrl: 'directives/enumerationMembers.html',
        scope: {
            members: '='
        },
        replace: true
    }
});
