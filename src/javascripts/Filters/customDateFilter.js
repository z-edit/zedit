ngapp.filter('customDate', function($filter) {
    return function(date) {
        // return Never if date is undefined
        if (!angular.isDefined(date)) return 'Never';
        return $filter('date')(date, 'medium');
    }
});
