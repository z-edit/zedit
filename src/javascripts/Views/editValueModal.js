ngapp.controller('editValueModalController', function($scope, $timeout, errorService, hotkeyService) {
    // variables
    let opts = $scope.modalOptions,
        node = opts.targetNode,
        handle = node.handles[opts.targetIndex],
        value = node.cells[opts.targetIndex + 1].value,
        vtLabel = xelib.valueTypes[node.value_type];

    xelib.valueTypes.forEach((key, index) => $scope[key] = index);
    $scope.path = xelib.Path(handle);
    $scope.vtClass = vtLabel;
    $scope.valueType = node.value_type;

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
        let index = opts.targetIndex,
            record = index === 0 ? opts.record : opts.overrides[index - 1];
        $scope.$root.$broadcast('recordUpdated', record);
        $scope.$emit('closeModal');
    };

    $scope.setupBytes = function(value) {
        let isPrintable = function(key) {
            return key > 33 && key !== 127;
        };

        let bytesToStr = function(bytes) {
            let a = bytes.map((byte) => { return parseInt(byte, 16); });
            return a.reduce(function(str, byte) {
                let char = isPrintable(byte) ? String.fromCharCode(byte) : '.';
                return str + char;
            }, '');
        };

        $scope.applyValue = function() {
            errorService.try(function() {
                xelib.SetValue(handle, '', $scope.bytes.join(' '));
                $scope.afterApplyValue();
            });
        };

        $scope.$watch('bytes', function() {
            $scope.text = bytesToStr($scope.bytes);
        }, true);

        $scope.bytes = value.split(' ');
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
      $scope.useHtmlEditor = htmlElements.includes(node.label);
      $scope.value = value;
    };


    $scope.setupReference = function(value) {
        $scope.signatures = xelib.GetAllowedSignatures(handle).sort();
        $scope.signature = $scope.signatures[0];
        $scope.handle = handle;
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
                active: flag !== '' && enabledFlags.includes(flag)
            }
        });
    };

    $scope.setupEnum = function(value) {
        $scope.options = xelib.GetEnumOptions(handle);
        $scope.value = value;
    };

    $scope.setupColor = function() {
        $scope.textChanged = function() {
            let c = tryParseColor($scope.value);
            $scope.invalid = !c;
            if (!$scope.invalid) $scope.color = c.toHex();
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
        let red = xelib.GetValueEx(handle, 'Red'),
            green = xelib.GetValueEx(handle, 'Green'),
            blue = xelib.GetValueEx(handle, 'Blue');
        $scope.value = `rgb(${red}, ${green}, ${blue})`;
        $scope.textChanged();
    };

    // initialization
    hotkeyService.buildOnKeyDown($scope, 'onKeyDown', 'editValueModal');

    let setupFunctions = {
        vtBytes: $scope.setupBytes,
        vtNumber: $scope.setupNumber,
        vtReference: $scope.setupReference,
        vtFlags: $scope.setupFlags,
        vtEnum: $scope.setupEnum,
        vtColor: $scope.setupColor,
        vtText: $scope.setupText
    };

    let defaultSetup = (value) => $scope.value = value;
    (setupFunctions[vtLabel] || defaultSetup)(value);
});
