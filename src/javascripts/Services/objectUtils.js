ngapp.service('objectUtils', function() {
    this.rebuildObject = function(obj, keys) {
        return Object.keys(obj).reduce(function(newObj, key) {
            if (keys.includes(key)) newObj[key] = obj[key];
            return newObj;
        }, {})
    };
});
