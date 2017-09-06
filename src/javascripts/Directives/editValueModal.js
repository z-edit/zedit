ngapp.directive('editValueModal', function () {
    return {
        restrict: 'E',
        templateUrl: 'directives/editValueModal.html',
        controller: 'editValueModalController',
        scope: false
    }
});

ngapp.controller('editValueModalController', function($scope, $timeout, errorService, formUtils) {
    // variables
    let node = $scope.targetNode,
        handle = node.handles[$scope.targetIndex],
        value = node.cells[$scope.targetIndex + 1].value,
        vtLabel = xelib.valueTypes[node.value_type];

    xelib.valueTypes.forEach((key, index) => $scope[key] = index);
    $scope.path = xelib.Path(handle);
    $scope.vtClass = vtLabel;

    let tryParseColor = function(color) {
        try { return new Color(color) } catch (e) {}
    };

    // scope functions
    $scope.applyValue = function() {
        if ($scope.invalid) return;
        errorService.try(function() {
            xelib.SetValue(handle, '', $scope.value);
            $scope.afterApplyValue();
        });
    };

    $scope.afterApplyValue = function() {
        let index = $scope.targetIndex,
            record = index == 0 ? $scope.record : $scope.overrides[index - 1];
        $scope.$root.$broadcast('recordUpdated', record);
        $scope.updateNodes();
        $scope.toggleEditModal();
    };

    $scope.setupBytes = function(value) {
        let isHexKey = function(key) {
            return (key > 47 && key < 58) || (key > 64 && key < 71);
        };

        let isPrintable = function(key) {
            return key > 33 && key !== 127;
        };

        let bytesToStr = function(bytes) {
            let a = bytes.map((byte) => { return parseInt(byte, 16); });
            return a.reduce(function(str, byte) {
                return str + (isPrintable(byte) ? String.fromCharCode(byte) : '.');
            }, '');
        };

        $scope.applyValue = function() {
            errorService.try(function() {
                xelib.SetValue(handle, '', $scope.bytes.join(' '));
                $scope.afterApplyValue();
            });
        };

        $scope.onByteKeyDown = function(e, index) {
            if (!isHexKey(e.keyCode)) return;
            let newChar = String.fromCharCode(e.keyCode).toUpperCase(),
                byte = $scope.bytes[index];
            if (byte[1] === ' ') {
                $scope.bytes[index] = byte[0] + newChar;
                $scope.text = bytesToStr($scope.bytes);
                let nextSpan = e.srcElement.nextElementSibling;
                if (nextSpan) {
                    nextSpan.focus();
                } else {
                    e.srcElement.blur();
                }
            } else {
                $scope.bytes[index] = newChar + ' ';
            }
        };

        $scope.onByteBlur = function(index) {
            let byte = $scope.bytes[index];
            if (byte[1] === ' ') {
                $scope.bytes[index] = '0' + byte[0];
                $scope.text = bytesToStr($scope.bytes);
            }
        };

        $scope.bytes = value.split(' ');
        $scope.text = bytesToStr($scope.bytes);
    };

    $scope.setupNumber = function(value) {
        $scope.textChanged = function() {
            let match = /^\-?([0-9]+)(\.[0-9]+)?$/i.exec($scope.value);
            $scope.invalid = !match;
        };
        $scope.value = value;
        $scope.textChanged();
    };

    $scope.setupText = function(value) {
      const htmlElements = ['DESC - Book Text'];
      $scope.useHtmlEditor = htmlElements.contains(node.label);
      $scope.value = value;
    };


    $scope.setupReference = function(value) {
        $scope.referenceSearch = function(str) {
            return xelib.FindValidReferences(handle, str, 10);
        };
        $scope.setCustomResult = (str) => $scope.value = str;
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
        $scope.defaultAction = $scope.applyValue;
        let enabledFlags = value.split(', ');
        $scope.flags = xelib.GetAllFlags(handle).map(function(flag) {
            return {
                name: flag,
                active: flag !== '' && enabledFlags.contains(flag)
            }
        });
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
            errorService.try(function() {
                let c = tryParseColor($scope.value);
                xelib.SetValue(handle, 'Red', c.getRed().toString());
                xelib.SetValue(handle, 'Green', c.getGreen().toString());
                xelib.SetValue(handle, 'Blue', c.getBlue().toString());
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
        vtColor: $scope.setupColor,
        vtText: $scope.setupText
    };

    if (setupFunctions.hasOwnProperty(vtLabel)) {
        setupFunctions[vtLabel](value);
    } else {
        $scope.value = value;
    }

    // inherited functions
    $scope.unfocusEditModal = formUtils.unfocusModal($scope.toggleEditModal);
});
