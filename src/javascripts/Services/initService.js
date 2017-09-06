ngapp.service('initService', function() {
    let initFunctions = [];
    this.add = (fn) => initFunctions.push(fn);
    this.init = () => initFunctions.forEach((fn) => fn());
});