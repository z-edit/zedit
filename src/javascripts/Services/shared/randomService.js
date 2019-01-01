ngapp.service('randomService', function() {
    let service = this,
        alphanumeric = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

    this.generateRandomString = function(length, chars) {
        let id = '', numChars = chars.length;
        for (let i = 0; i < length; i++) {
            id += chars[Math.floor(Math.random() * numChars)];
        }
        return id;
    };

    this.generateUniqueId = function() {
        return service.generateRandomString(32, alphanumeric);
    };

    this.randomCheck = function(chance) {
        return Math.random() < chance;
    };

    this.randomInt = function(min, max) {
        return min + Math.floor(Math.random() * (max - min + 1));
    };

    this.weightedInt = function(min, max, weight = 1) {
        let n = Math.random();
        for (let i = weight; i > 1; i--) n *= Math.random();
        let half = (max - min) / 2.0,
            offset = n * half;
        if (Math.random() > 0.5) offset = 0 - offset;
        return min + Math.floor(half + offset);
    };
});
