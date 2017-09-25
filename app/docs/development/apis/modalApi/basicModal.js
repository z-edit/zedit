ngapp.controller('basicModalController', function($scope) {
    $scope.apply = function() {
        console.log('Enabled: ', $scope.modalOptions.enabled);
        console.log('Text: ', $scope.modalOptions.text);
        $scope.$emit('closeModal');
    };
});
