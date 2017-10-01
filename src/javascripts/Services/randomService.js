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
});
