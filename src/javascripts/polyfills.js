String.prototype.setChar = function(pos, char) {
    return this.substr(0, pos) + char + this.substr(pos + 1, this.length);
};

String.prototype.equals = function(str, ignoreCase = false) {
    return ignoreCase ?
        this.toLowerCase() === str.toLowerCase() :
        this === str;
};

String.prototype.contains = function(str, ignoreCase = false) {
    return ignoreCase ?
        this.toLowerCase().includes(str.toLowerCase()) :
        this.includes(str);
};

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};

String.prototype.uncapitalize = function() {
    return this.charAt(0).toLowerCase() + this.slice(1);
};

String.prototype.titleCase = function() {
    return this.replace(/[^\s]+/g, function(word) {
        return word.capitalize();
    });
};

String.prototype.humanize = function() {
    return this.underscore(' ').titleCase();
};

String.prototype.toCamelCase = function() {
    return this.uncapitalize().replace(/(\s|\-|\_|\.)+(.)/g, function(match) {
        return match.slice(-1).toUpperCase();
    });
};

String.prototype.toPascalCase = function() {
    return this.toCamelCase().capitalize();
};

String.prototype.underscore = function(separator = '_') {
    return this.toCamelCase().replace(/[A-Z]/g, function(match) {
        return separator + match.toLowerCase();
    })
};

String.prototype.wordCount = function() {
    if (this.length) {
        let match = this.match(/(\S+)/g);
        return (match && match.length) || 0;
    } else {
        return 0;
    }
};

String.prototype.wordwrap = function(width = 60, brk = '\n', cut = false) {
    let cutExpr = cut ? `|.{${width}}|.+$` : `|\\S+?(\\s|$)`,
        expr = `.{1,${width}}(\\s|$)${cutExpr}`;
    return this.match(new RegExp(expr, 'g')).map(function(str) {
        return str.trim()
    }).join(brk);
};

// convert integer to a bytes string
const byteUnits = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'];

Number.prototype.toBytes = function(precision = 1) {
    let number = Math.floor(Math.log(this) / Math.log(1024)),
        value = this / Math.pow(1024, Math.floor(number));
    return `${value.toFixed(precision)} ${byteUnits[number]}`;
};

// parse input bytes string into an integer
window.parseBytes = function(bytesString) {
    let sp = bytesString.split(' '),
        power = byteUnits.indexOf(sp[1]);
    if (power === -1) return 0;
    return Math.floor(Number.parseFloat(sp[0]) * Math.pow(1024, power));
};

Number.prototype.toPercentage = function(precision = 1) {
    return (this * 100).toFixed(precision).toString() + "%";
};

// concatenates this with array and assigns the result to this
// does nothing if either this or array are undefined
Array.prototype.unite = function(array) {
    if (this && array) {
        for (let i = 0; i < array.length; i++) {
            this.push(array[i]);
        }
    }
};

// gets a random item from the array
Array.prototype.random = function() {
    return this[Math.floor((Math.random() * this.length))];
};

Array.prototype.remove = function(needle) {
    let n = this.indexOf(needle);
    if (n > -1) this.splice(n, 1);
    return n;
};

Array.prototype.subtract = function(otherArray) {
    if (!otherArray) return this;
    return this.filter((item) => { return !otherArray.includes(item) });
};

Array.prototype.findByKey = function(key, value) {
    return this.find((item) => { return item[key] === value });
};

Array.prototype.sortOnKey = function(key) {
    return this.sort(function(a, b) {
        if (a[key] < b[key]) return -1;
        if (a[key] > b[key]) return 1;
        return 0;
    });
};

Array.prototype.groupBy = function(propertyName) {
    let obj = {};
    this.forEach(function(item) {
        let key = item[propertyName] + '';
        if (obj.hasOwnProperty(key)) {
            obj[key].push(item);
        } else {
            obj[key] = [item];
        }
    });
    return obj;
};

Array.prototype.equals = function(otherArray) {
    if (!otherArray || this.length !== otherArray.length) return false;
    for (let index = 0; index < this.length; index++) {
        let item = this[index],
            otherItem = otherArray[index],
            itemType = typeof item,
            otherItemType = typeof otherItem;
        if (itemType !== otherItemType) return false;
        if (itemType === 'object') {
            if (!item.equals(otherItem)) return false;
        } else if (item !== otherItem) {
            return false;
        }
    }
    return true;
};

Array.prototype.forEachReverse = function(callback) {
    for (let i = this.length; i > -1; i--) {
        callback(this[i], i, this);
    }
};

Array.prototype.forEachNested = function(callback, nestingKey) {
    let nestedCallback = function(element, index, array) {
        if (callback(element, index, array) && element.hasOwnProperty(nestingKey)) {
            element[nestingKey].forEachReverse(nestedCallback);
        }
    };
    this.forEachReverse(nestedCallback);
};

Array.prototype.trimFalsy = function() {
    let n;
    for (n = this.length - 1; n > -1; n--) {
        if (this[n]) break;
    }
    return n < this.length - 1 ? this.slice(0, n + 1) : this;
};

Array.prototype.last = function() {
    return this[this.length - 1];
};

Object.prototype.equals = () => {};
Object.defineProperty(Object.prototype, 'equals', {
    enumerable: false,
    value: function(otherObject) {
        if (!object || !otherObject) return false;
        let object = this,
            objectKeys = Object.keys(object);
        if (!objectKeys.equals(Object.keys(otherObject))) return false;
        for (let i = 0; i < objectKeys.length; i++) {
            let key = objectKeys[i],
                value = object[key], otherValue = otherObject[key],
                valueType = typeof value, otherValueType = typeof otherValue;
            if (valueType !== otherValueType) return false;
            if (valueType === 'object') {
                if (!value.equals(otherValue)) return false;
            } else if (value !== otherValue) {
                return false;
            }
        }
        return true;
    }
});

Object.deepAssign = function(target, varArgs) {
    if (target === null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
    }

    let to = Object(target);
    for (let index = 1; index < arguments.length; index++) {
        let nextSource = arguments[index];
        if (nextSource === null) continue; // Skip over if undefined or null
        Object.keys(nextSource).forEach(function (nextKey) {
            let value = nextSource[nextKey];
            if (typeof value === 'object' && value.constructor === Object) {
                if (!Object.prototype.hasOwnProperty.call(to, nextKey)) {
                    to[nextKey] = {};
                }
                Object.deepAssign(to[nextKey], value);
            } else {
                to[nextKey] = value;
            }
        });
    }
    return to;
};

Object.defaults = function(target, defaults) {
    Object.keys(defaults).forEach(function(key) {
        if (target.hasOwnProperty(key)) return;
        target[key] = defaults[key];
    })
};
