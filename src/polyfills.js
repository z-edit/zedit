String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.uncapitalize = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

String.prototype.titleCase = function() {
    return this.replace(/[^-'\s]+/g, function(word) {
        return word.replace(/^./, function(first) {
            return first.toUpperCase();
        });
    });
};

String.prototype.toCamelCase = function() {
    return this.uncapitalize().replace(/(\s|\-|\_|\.)+(.)/g, function(match) {
        return match.slice(-1).toUpperCase();
    });
};

String.prototype.startsWith = function(needle) {
    return (this.indexOf(needle) == 0);
};

String.prototype.toPascalCase = function() {
    return this.toCamelCase().capitalize();
};

String.prototype.underscore = function(separator) {
    if (!separator) separator = "_";
    return this.toCamelCase().replace(/[A-Z]/g, function(match) {
        return separator + match.toLowerCase();
    })
};

String.prototype.wordCount = function() {
    if (this.length) {
        var match = this.match(/(\S+)/g);
        return (match && match.length) || 0;
    } else {
        return 0;
    }
};

String.prototype.surround = function(str) {
    return str + this + str;
};

String.prototype.reduceText = function(numWords) {
    var lines = this.split('\n');
    var result = '';
    while (result.wordCount() < numWords && lines.length) {
        result += lines.shift() + '\n';
    }
    return result.trim();
};

String.prototype.wordwrap = function(width, brk, cut) {
    brk = brk || '\n';
    width = width || 60;
    var regex = '.{1,' +width+ '}(\\s|$)' + (cut ? '|.{' +width+ '}|.+$' : '|\\S+?(\\s|$)');

    return this.match(new RegExp(regex, 'g')).map(function(str) {
        return str.trim()
    }).join(brk);
};

// convert integer to a bytes string
Number.prototype.toBytes = function(precision) {
    if (typeof precision === 'undefined') precision = 1;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
        number = Math.floor(Math.log(this) / Math.log(1024));
    return (this / Math.pow(1024, Math.floor(number))).toFixed(precision) +  ' ' + units[number];
};

// parse input bytes string into an integer
Number.prototype.parseBytes = function(bytesString) {
    var sp = bytesString.split(' ');
    if (!sp || sp.length < 2) return 0;
    var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];
    var power = units.indexOf(sp[1]);
    if (power == -1) {
        return 0;
    } else {
        return Math.floor(Number.parseFloat(sp[0]) * Math.pow(1024, power));
    }
};

Number.prototype.toPercentage = function(precision) {
    return (this * 100).toFixed(precision).toString() + "%";
};

// concatenates this with array and assigns the result to this
// does nothing if either this or array are undefined
Array.prototype.unite = function(array) {
    if (this && array) {
        for (var i = 0; i < array.length; i++) {
            this.push(array[i]);
        }
    }
};

// gets a random item from the array
Array.prototype.random = function() {
    return this[Math.floor((Math.random() * this.length))];
};

Array.prototype.contains = function(needle) {
    return (this.indexOf(needle) > -1);
};

Array.prototype.remove = function(needle) {
    var n = this.indexOf(needle);
    if (n > -1) this.splice(n, 1);
    return n;
};

Array.prototype.sortAlphabetically = function(key) {
    return this.sort(function(a, b) {
        if (a[key] < b[key]) {
            return -1;
        }
        if (a[key] > b[key]) {
            return 1;
        }
        return 0;
    })
};

Array.prototype.groupBy = function(propertyName) {
    var obj = {};
    this.forEach(function(item) {
        var key = item[propertyName] + '';
        if (obj.hasOwnProperty(key)) {
            obj[key].push(item);
        } else {
            obj[key] = [item];
        }
    });
    return obj;
};

Array.prototype.equals = function(otherArray) {
    if (!otherArray || this.length != otherArray.length) return false;
    return this.reduce(function(equal, item, index) {
        var otherItem = otherArray[index];
        var itemType = typeof item, otherItemType = typeof otherItem;
        if (itemType !== otherItemType) return false;
        return equal && (itemType === "object" ? item.equals(otherItem) : item === otherItem);
    }, true);
};

Array.prototype.forEachDesc = function(callback) {
    for (var i = this.length; i > -1; i--) {
        callback(this[i], i, this);
    }
};

Array.prototype.forEachNested = function(callback, nestingKey) {
    var nestedCallback = function(element, index, array) {
        if (callback(element, index, array) && element.hasOwnProperty(nestingKey)) {
            element[nestingKey].forEachDesc(nestedCallback);
        }
    };
    this.forEachDesc(nestedCallback);
};

Array.prototype.trimFalsy = function() {
    var n;
    for (n = this.length - 1; n > -1; n--) {
        if (this[n]) break;
    }
    return n < this.length - 1 ? this.slice(0, n + 1) : this;
};


Object.prototype.equals = function(otherObject) {
    if (!otherObject) return false;
    var object = this, objectKeys = Object.prototype.keys(object);
    if (!objectKeys.equals(Object.prototype.keys(otherObject))) return false;
    return objectKeys.reduce(function(equal, key) {
        var value = object[key], otherValue = otherObject[key];
        var valueType = typeof value, otherValueType = typeof otherValue;
        if (valueType !== otherValueType) return false;
        // this will call Array.prototype.equals for arrays and Object.prototype.equals for objects
        return equal && (valueType === "object" ? value.equals(otherValue) : value === otherValue);
    }, true);
};
Object.defineProperty(Object.prototype, "equals", {enumerable: false});

// angular polyfills
angular.inherit = function(scope, attribute) {
    if (angular.isUndefined(scope[attribute])) {
        scope[attribute] = scope.$parent[attribute];
    }
};

angular.default = function(scope, attribute, value) {
    if (angular.isUndefined(scope[attribute])) {
        scope[attribute] = value;
    }
};

angular.copyProperties = function(source, destination) {
    for (var prop in source) {
        if (source.hasOwnProperty(prop)) {
            destination[prop] = source[prop];
        }
    }
};

angular.inheritScope = function(scope, attribute) {
    let obj = scope[attribute] || scope.$parent[attribute];
    if (angular.isUndefined(obj)) return;
    angular.copyProperties(obj, scope);
};