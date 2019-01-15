ngapp.service('recentService', function() {
    let dictionary = {};

    this.store = function(key, max) {
        if (dictionary.hasOwnProperty(key)) return;
        dictionary[key] = { max, items: [] };
    };

    this.get = function(key) {
        return dictionary[key].items;
    };

    this.add = function(key, value) {
        let {items, max} = dictionary[key];
        let n = items.indexOf(value);
        (n === -1) ? items.length >= max && items.pop() : items.splice(n, 1);
        items.unshift(value);
    };
});
