ngapp.directive('supportedGames', function() {
    return {
        restrict: 'E',
        template: '<ul><li ng-repeat="game in games">{{::game.name}}</li></ul>',
        link: (scope) => scope.games = xelib.games
    }
});
