ngapp.controller('editColumnsModalController', function($scope, xelibService, columnsService) {
    // helper functions
    let getNewColumnLabel = function() {
        let baseLabel = "New Column",
            label = baseLabel,
            counter = 1;
        while ($scope.allColumns.find((column) => { return column.label === label })) {
            counter++;
            label = `${baseLabel} ${counter}`;
        }
        return label;
    };

    // scope functions
    $scope.addColumn = function() {
        $scope.allColumns.push({
            label: getNewColumnLabel(),
            enabled: false,
            custom: true,
            getDataCode:
                "if (node.element_type === xelib.etMainRecord) {\n" +
                "    return xelib.FullName(node.handle, true);\n" +
                "}"
        });
        $scope.selectColumn($scope.allColumns.last());
    };

    $scope.selectColumn = function(index) {
        $scope.selectedIndex = index;
        $scope.selectedColumn = $scope.allColumns[index];
    };

    $scope.deleteColumn = function() {
        $scope.allColumns.splice($scope.selectedIndex, 1);
        $scope.selectedIndex = -1;
        $scope.selectedColumn = undefined;
    };

    $scope.testCode = function() {
        // TODO
    };

    $scope.close = function() {
        $scope.allColumns.forEach(function(column) {
            if (column.custom) columnsService.buildDataFunction(column);
        });
        $scope.$root.$broadcast('rebuildColumns');
        columnsService.saveColumns($scope.viewName);
        $scope.$emit('closeModal');
    };

    // initialization
    $scope.allColumns = $scope.modalOptions.allColumns;
    $scope.viewName = $scope.modalOptions.viewName;
    let firstCustomColumn = $scope.allColumns.find(function(column) {
        return column.custom;
    });
    if (firstCustomColumn) $scope.selectColumn(firstCustomColumn);
});
