ngapp.directive('elementView', function () {
    let buildObjectView = function(obj) {
        let children = [];
        for (let key in obj) {
            if (!obj.hasOwnProperty(key)) continue;
            let child = { key: obj.Constructor === Array ? '[' + key + ']' : key };
            if (typeof(obj[key]) === 'object') {
                if (Object.keys(obj).length === 0) {
                    child.value = '';
                } else {
                    child.children = buildObjectView(obj[key]);
                }
            } else {
                child.value = obj[key];
            }
            children.push(child);
        }
        return children;
    };

    let getRecordView = function(handle) {
        try {
            let obj = xelib.ElementToObject(handle);
            return buildObjectView(obj);
        } catch (e) {
            console.log(e);
            return [];
        }
    };

    let highlightField = function(view, path) {
        try {
            let parts = path.split('\\');
            let fields = view;
            parts.forEach(function(part) {
                if (part.startsWith('[') && part.endsWith(']')) {
                    part = part.slice(1, -1);
                }
                let nextField = fields.find(function(field) {
                    return (field.key === part);
                });
                if (!nextField) {
                    throw "Could not find field " + part;
                } else if (nextField.hasOwnProperty('children')) {
                    nextField.showChildren = true;
                    fields = nextField.children;
                } else {
                    nextField.highlight = true;
                }
            });
        } catch (e) {
            console.log(e);
        }
    };

    return {
        restrict: 'E',
        templateUrl: 'directives/elementView.html',
        scope: {
            view: '=?',
            handle: '=?',
            highlight: '=?'
        },
        link: function(scope) {
            scope.$watch('handle', function() {
                if (!scope.handle) return;
                scope.view = getRecordView(scope.handle);
            });

            scope.$watch('highlight', function() {
                if (!scope.highlight) return;
                highlightField(scope.view, scope.highlight);
            })
        }
    }
});
