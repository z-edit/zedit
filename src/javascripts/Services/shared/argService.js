ngapp.service('argService', function() {
    let unwrap = function(str) {
        if (str[0] === '"' && str[str.length - 1] === '"')
            return str.slice(1, -1);
        return str;
    };

    this.getArgValue = function(key) {
        let arg = argv.find(arg => arg.startsWith(key));
        return arg && unwrap(arg.slice(key.length + 1));
    };
});
