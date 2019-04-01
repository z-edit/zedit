ngapp.directive('recordAddressBar', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/recordAddressBar.html',
        controller: 'recordAddressBarController'
    }
});

ngapp.controller('recordAddressBarController', function($scope, $element, xelibService, hotkeyService, htmlHelpers) {
    let addressInput = htmlHelpers.resolveElement($element[0], 'input');

    // scope variables
    $scope.history = [];
    $scope.historyIndex = -1;

    // inherited functions
    hotkeyService.buildOnKeyDown($scope, 'onAddressKeyDown', 'addressBar');

    // scope functions
    $scope.historyGo = function() {
        if ($scope.historyIndex < 0) {
            $scope.address = '';
            $scope.$emit('setRecord', undefined);
        } else {
            let entry = $scope.history[$scope.historyIndex];
            $scope.skipHistory = true;
            $scope.address = entry.path;
            $scope.go();
        }
    };

    $scope.back = function() {
        if ($scope.historyIndex <= 0) return;
        $scope.historyIndex--;
        $scope.historyGo();
    };

    $scope.forward = function() {
        if ($scope.historyIndex === $scope.history.length - 1) return;
        $scope.historyIndex++;
        $scope.historyGo();
    };

    $scope.go = function() {
        try {
            let record = xelib.GetElementEx(0, $scope.address);
            $scope.$emit('setRecord', record);
            addressInput.blur();
        } catch (x) {
            console.log(x);
            $scope.notFound = true;
        }
    };

    $scope.closeBar = function() {
        $scope.toggleAddressBar();
    };

    $scope.setAddress = function(showPath) {
        if ($scope.historyIndex > -1) {
            let entry = $scope.history[$scope.historyIndex];
            $scope.address = entry[showPath ? 'path' : 'name'];
        } else {
            $scope.address = '';
        }
    };

    $scope.onAddressFocus = function() {
        $scope.setAddress(true);
    };

    $scope.onAddressBlur = function() {
        $scope.notFound = false;
        $scope.setAddress();
    };

    $scope.buildHistoryEntry = function(record) {
        let entry = undefined;
        xelib.WithHandle(xelib.GetElementFile(record), function(file) {
            entry = {
                name: `${xelib.Name(file)} - ${xelib.Name(record)}`,
                path: `${xelib.Path(record)}`
            };
        });
        return entry;
    };

    $scope.linkView = function() {
        $scope.$emit('linkView', $scope.view);
    };

    $scope.unlinkView = function() {
        $scope.view.unlinkAll();
    };

    // event handling
    $scope.$on('recordChanged', function() {
        if ($scope.skipHistory) {
            $scope.skipHistory = false;
            $scope.setAddress();
            return;
        }
        let entry = $scope.buildHistoryEntry($scope.record);
        if (!entry) return;
        $scope.history.push(entry);
        $scope.historyIndex = $scope.history.length - 1;
        $scope.setAddress();
    });

    $scope.$on('deleteElement', function(e, handle, elementType) {
        if (elementType !== xelib.etMainRecord) return;
        let path = xelib.Path(handle),
            newIndex = $scope.historyIndex;
        $scope.history = $scope.history.filter((entry, index) => {
            if (index < $scope.historyIndex) newIndex--;
            return entry.path !== path;
        });
        $scope.historyIndex = Math.min(newIndex, $scope.history.length - 1);
        $scope.historyGo();
    });

    $scope.$on('navBack', $scope.back);
    $scope.$on('navForward', $scope.forward);
});
