ngapp.value('mergeSortModes', [{
    name: 'None',
    getSortFunction: () => {
        return () => 0;
    }
}, {
    name: 'Merge name',
    getSortFunction: (scope) => {
        let isAsc = scope.sortDirection === 'ASC';
        return (merge1, merge2) => {
            if (merge1.name > merge2.name) return isAsc ? -1 : 1;
            if (merge2.name > merge1.name) return isAsc ? 1 : -1;
            return 0;
        };
    }
}]);
