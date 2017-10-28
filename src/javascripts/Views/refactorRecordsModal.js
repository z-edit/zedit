ngapp.controller('refactorRecordsModalController', function($scope) {
    // helper functions
    let strFunctions = {
        'Append': function(value) {
            return value + $scope.refactorStr;
        },
        'Prepend': function(value) {
            return $scope.refactorStr + value;
        },
        'Replace': function(value) {
            let expr = new RegExp($scope.findStr, 'g');
            return value.replace(expr, $scope.refactorStr);
        }
    };

    let applyStrFunction = function(value) {
        return strFunctions[$scope.refactorFunction](value);
    };

    let refactorStrFunction = function(path) {
        return function() {
            $scope.modalOptions.nodes.forEach(function(node) {
                if (!xelib.HasElement(node.handle, path)) return;
                let oldValue = xelib.GetValue(node.handle, path),
                    newValue = applyStrFunction(oldValue);
                if (newValue !== oldValue)
                    xelib.SetValue(node.handle, path, newValue);
            });
        };
    };

    let setBaseFormID = function() {
        let record = $scope.modalOptions.nodes[0].handle;
        xelib.WithHandle(xelib.GetElementFile(record), function(file) {
            let loadOrder = xelib.GetFileLoadOrder(file),
                nextFormID = xelib.GetNextObjectID(file);
            $scope.baseFormID = (loadOrder << 24) + nextFormID;
        });
    };

    let refactor = {
        'Names': refactorStrFunction('FULL'),
        'Editor IDs': refactorStrFunction('EDID'),
        'Form IDs': function() {
            $scope.modalOptions.nodes.forEach(function(node, n) {
                xelib.SetFormID(node.handle, $scope.baseFormID + n);
            });
        }
    };

    // scope functions
    $scope.doRefactor = function() {
        refactor[$scope.refactorMode]();
        $scope.$root.$broadcast('reloadGUI');
        $scope.$emit('closeModal');
    };

    // initialization
    $scope.modes = ['Names', 'Editor IDs', 'Form IDs'];
    $scope.functions = ['Append', 'Prepend', 'Replace'];
    $scope.refactorMode = $scope.modes[0];
    $scope.refactorFunction = $scope.functions[0];
    $scope.refactorStr = '';
    setBaseFormID();
});