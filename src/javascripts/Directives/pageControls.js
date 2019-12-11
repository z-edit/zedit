ngapp.directive('pageControls', function($parse) {
    return {
        restrict: 'E',
        scope: false,
        templateUrl: 'directives/pageControls.html',
        controller: 'pageControlsController',
        link: function(scope, element, attrs) {
            scope.perPage = $parse(attrs.perPage);

            scope.$watch(attrs.items, function() {
                scope.numItems = scope[attrs.items].length;
                scope.numPages = Math.ceil(scope.numItems / scope.perPage);
                scope.pages = Array.from({length: 5}, (v, k) => k + 1);
                scope.currentPage = 1;
            });
        }
    }
});

ngapp.controller('pageControlsController', function($scope) {
    const pageDistance = 3;

    let inRange = page => Math.abs($scope.currentPage - page) < pageDistance;
    let onEdge = page => page === 1 || page === $scope.numPages;
    let showPage = page => onEdge(page) || inRange(page);

    let addPage = function(number, showElipsis) {
        return $scope.visiblePages.push({number, showElipsis});
    };

    let updateVisiblePages = function() {
        let prev = true;
        $scope.visiblePages = [];
        $scope.pages.forEach(page => {
            prev = showPage(page) && addPage(page, !prev);
        });
    };

    $scope.goToPage = function(page) {
        $scope.currentPage = page;
        modalHelpers.scrollToTop();
    };

    $scope.$watch('currentPage', function() {
        $scope.offset = $scope.perPage * ($scope.currentPage - 1);
    });

    $scope.$watch('currentPage', updateVisiblePages);
});
