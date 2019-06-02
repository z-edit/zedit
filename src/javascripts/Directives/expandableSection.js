ngapp.directive('expandableSection', function($timeout, eventService) {
    return {
        restrict: 'E',
        transclude: {
            sectionTitle: 'sectionTitle',
            content: 'content'
        },
        templateUrl: 'directives/expandableSection.html',
        link: function(scope, element) {
            let titleElement = element[0].children[0],
                iconElement = titleElement.children[0],
                contentElement = element[0].children[1];

            eventService.handleEvents(scope, titleElement, {
                click: () => {
                    contentElement.classList.toggle('ng-hide');
                    iconElement.classList.toggle('collapsed');
                    iconElement.classList.toggle('expanded');
                    $timeout(() => scope.$broadcast('vsRepeatTrigger'));
                }
            });
        }
    }
});
