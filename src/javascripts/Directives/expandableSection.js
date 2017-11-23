ngapp.directive('expandableSection', function() {
    return {
        restrict: 'E',
        transclude: {
            title: 'title',
            content: 'content'
        },
        templateUrl: 'directives/expandableSection.html',
        link: function(scope, element) {
            let titleElement = element[0].children[0],
                contentElement = element[0].children[1];

            titleElement.addEventListener('click', function() {
                contentElement.classList.toggle('ng-hide');
            });
        }
    }
});