ngapp.service('htmlHelpers', function() {
    var service = this;

    this.resolveByClass = function(klass) {
        return function(child) {
            return child.classList.contains(klass);
        };
    };

    this.resolveByID = function(id) {
        return function(child) {
            return child.id === id.toUpperCase();
        };
    };

    this.resolveByTagName = function(tagName) {
        return function(child) {
            return child.tagName === tagName.toUpperCase();
        };
    };

    this.getResolveFunction = function(part) {
        if (part[0] == '.') {
            return service.resolveByClass(part.slice(1));
        } else if (part[0] == '#') {
            return service.resolveByID(part.slice(1));
        } else {
            return service.resolveByTagName(part);
        }
    };

    this.findChild = function(element, testFn) {
        for (let i = 0; i < element.children.length; i++) {
            let child = element.children[i];
            if (testFn(child)) return child;
        }
    };

    this.resolve = function(element, part) {
        let resolveFn = service.getResolveFunction(part);
        return service.findChild(element, resolveFn);
    };

    this.resolveElement = function(node, path) {
        let parts = path.split('/');
        let result = node;
        for (let i = 0; i < parts.length; i++) {
            result = service.resolve(result, parts[i]);
            if (!result) return;
        }
        return result;
    };
});