ngapp.directive('editValueModal', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/editValueModal.html',
        controller: 'editValueModalController',
        scope: false
    }
});

ngapp.controller('editValueModalController', function($scope, $timeout, formUtils, listViewFactory) {
    // variables
    let node = $scope.targetNode,
        handle = node.handles[$scope.targetIndex],
        value = node.cells[$scope.targetIndex + 1].value,
        vtLabel = xelib.valueTypes[node.value_type];
    xelib.valueTypes.forEach((key, index) => $scope[key] = index);
    $scope.path = xelib.Path(handle);
    $scope.vtClass = vtLabel;

    var tryParseColor = function(color) {
        try { return new Color(color) } catch (e) {}
    };

    var alertException = function(callback) {
        try { callback() } catch (e) { alert(e) }
    };

    // scope functions
    $scope.applyValue = function() {
        if ($scope.invalid) return;
        alertException(function() {
            xelib.SetValue(handle, '', $scope.value);
            $scope.afterApplyValue();
        });
    };

    $scope.afterApplyValue = function() {
        $scope.updateNode(node);
        $scope.toggleEditModal();
    };

    $scope.setupBytes = function(value) {
        $scope.value = value.replace(/ /g, '');
    };

    $scope.setupNumber = function(value) {
        $scope.textChanged = function() {
            let match = /^([0-9]+)(\.[0-9]+)?$/i.exec($scope.value);
            $scope.invalid = !match;
        };
        $scope.value = value;
        $scope.textChanged();
    };

    $scope.setupReference = function(value) {
        // TODO: load allowed references
        $scope.value = value;
    };

    $scope.setupFlags = function(value) {
        $scope.applyValue = function() {
            let activeFlags = $scope.flags.filter((flag) => { return flag.active; });
            $scope.value = activeFlags.map((flag) => { return flag.name; });
            xelib.SetEnabledFlags(handle, '', $scope.value);
            $scope.afterApplyValue();
        };

        // initialize flags
        $scope.prevIndex = undefined;
        let enabledFlags = value.split(', ');
        $scope.flags = xelib.GetAllFlags(handle).map(function(flag) {
            return {
                name: flag,
                active: flag !== '' && enabledFlags.contains(flag)
            }
        });

        // inherited functions
        listViewFactory.build($scope, 'flags', 'applyValue');
    };

    $scope.setupEnum = function(value) {
        $scope.options = xelib.GetEnumOptions(handle);
        $scope.value = value;
    };

    $scope.setupColor = function(value) {
        $scope.textChanged = function() {
            let c = tryParseColor($scope.value);
            $scope.invalid = !c;
            if (!$scope.invalid) {
                $scope.color = c.toHex();
                $scope.colorStyle = {'background-color': `${$scope.value}`};
            }
        };

        $scope.applyValue = function() {
            if ($scope.invalid) return;
            alertException(function() {
                let c = tryParseColor($scope.value);
                xelib.SetValue(handle, 'Red', c.getRed());
                xelib.SetValue(handle, 'Green', c.getGreen());
                xelib.SetValue(handle, 'Blue', c.getBlue());
                $scope.afterApplyValue();
            });
        };

        $scope.$watch('color', function() {
            let c = new Color($scope.color);
            $scope.value = c.toRGB();
            $scope.colorStyle = {'background-color': `${$scope.value}`};
        });

        // initialize color
        let red = xelib.GetValue(handle, 'Red'),
            green = xelib.GetValue(handle, 'Green'),
            blue = xelib.GetValue(handle, 'Blue');
        $scope.value = `rgb(${red}, ${green}, ${blue})`;
        $scope.textChanged();
    };

    // initialization
    let setupFunctions = {
        vtBytes: $scope.setupBytes,
        vtNumber: $scope.setupNumber,
        vtReference: $scope.setupReference,
        vtFlags: $scope.setupFlags,
        vtEnum: $scope.setupEnum,
        vtColor: $scope.setupColor
    };

    if (setupFunctions.hasOwnProperty(vtLabel)) {
        setupFunctions[vtLabel](value);
    } else {
        $scope.value = value;
    }

    // inherited functions
    $scope.unfocusEditModal = formUtils.unfocusModal($scope.toggleEditModal);
});
