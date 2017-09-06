ngapp.service('initService', function() {
    let initializers = {
        start: [],
        afterLoad: []
    };

    this.add = (label, fn) => initializers[label].push(fn);

    this.init = (label) => {
        let functions = initializers[label];
        while (functions.length > 0) functions.pop()();
    };
});