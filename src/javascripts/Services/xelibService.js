ngapp.service('xelibService', function() {
    var service = this;

    this.getExceptionInformation = function() {
        try {
            console.log(xelib.GetMessages());
            console.log(xelib.GetExceptionMessage());
        } catch (e) {
            console.log("Failed to get exception information: " + e);
        }
    };

    this.printGlobals = function() {
        try {
            console.log(xelib.GetGlobals());
        } catch (e) {
            console.log(e);
            service.getExceptionInformation();
        }
    };

    this.startSession = function(profile) {
        xelib.SetGamePath(profile.gamePath);
        xelib.SetLanguage(profile.language);
        xelib.SetGameMode(profile.gameMode);
    };

    this.logXELibMessages = function() {
        console.log(xelib.GetMessages());
    };

    this.buildObjectView = function(obj) {
        var children = [];
        for (var key in obj) {
            if (obj.hasOwnProperty(key)) {
                var child = { key: obj.Constructor === Array ? '[' + key + ']' : key };
                if (typeof(obj[key]) === 'object') {
                    if (Object.keys(obj).length == 0) {
                        child.value = '';
                    } else {
                        child.children = service.buildObjectView(obj[key]);
                    }
                } else {
                    child.value = obj[key];
                }
                children.push(child);
            }
        }
        return children;
    };

    this.getRecordView = function(handle) {
        try {
            var obj = xelib.ElementToObject(handle);
            return service.buildObjectView(obj);
        } catch (e) {
            console.log(e);
            return [];
        }
    };

    this.highlightField = function(view, path) {
        try {
            var parts = path.split('\\');
            var fields = view;
            parts.forEach(function(part) {
                if (part.startsWith('[') && part.endsWith(']')) {
                    part = part.slice(1, -1);
                }
                var nextField = fields.find(function(field) {
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

    this.withElement = function(handle, path, callback) {
        var element = xelib.GetElement(handle, path);
        try {
            callback(element);
        } finally {
            xelib.Release(element);
        }
    };

    this.withElementFile = function(handle, callback) {
        var file = xelib.GetElementFile(handle);
        try {
            callback(file);
        } finally {
            xelib.Release(file);
        }
    };

    this.withElements = function(handle, path, callback) {
        let elements = xelib.GetElements(handle, path);
        try {
            callback(elements);
        } finally {
            elements.forEach(xelib.Release);
        }
    };

    this.withRecords = function(handle, search, includeOverrides, callback) {
        let records = xelib.GetRecords(handle, search, includeOverrides);
        try {
            callback(records);
        } finally {
            records.forEach(xelib.Release);
        }
    };

    this.withLinksTo = function(handle, path, callback) {
        let element = xelib.GetLinksTo(handle, path);
        try {
            callback(element);
        } finally {
            xelib.Release(element);
        }
    };

    this.MoveVerticesUnderground = function(handle) {
        service.withElement(handle, 'NVNM\\Vertices', function(vertices) {
            for (var i = 0; i < xelib.ElementCount(vertices); i++) {
                let z = xelib.GetFloatValue(vertices, `[${i}]\\Z`);
                xelib.SetFloatValue(vertices, `[${i}]\\Z`, z - 30000.0);
            }
        });
    };

    this.RemoveEdgeLinkFlags = function(triangle) {
        let flags = xelib.GetUIntValue(triangle, `Flags`);
        let originalFlags = flags;
        if (flags & 1) {
            xelib.SetIntValue(triangle, `Edge 0-1`, -1);
            flags -= 1;
        }
        if (flags & 2) {
            xelib.SetIntValue(triangle, `Edge 1-2`, -1);
            flags -= 2;
        }
        if (flags & 4) {
            xelib.SetIntValue(triangle, `Edge 2-0`, -1);
            flags -= 4;
        }
        if (flags !== originalFlags) {
            xelib.SetUIntValue(triangle, `Flags`, flags);
            return true;
        }
    };

    this.withOverride = function(record, file, callback) {
        let override = xelib.AddElement(file, service.HexFormID(record));
        if (!callback(override)) {
            xelib.RemoveElement(override);
        }
    };

    this.RemoveLinkedEdgeLinks = function(currentFile, currentForm, form, edgeLink) {
        service.withLinksTo(edgeLink, 'Mesh', function(mesh) {
            if (xelib.HasElement(currentFile, service.HexFormID(mesh))) return;
            service.withOverride(mesh, currentFile, function(override) {
                let triangle = xelib.GetIntValue(edgeLink, 'Triangle');
                let changed = false;
                service.withElement(override, `NVNM\\Triangles\\[${triangle}]`, function(meshTriangle) {
                    changed = changed || service.RemoveEdgeLinkFlags(meshTriangle);
                });
                if (!form) {
                    changed = changed || service.RemoveEdgeLinks(override, currentForm);
                }
                return changed;
            });
        });
    };

    this.RemoveEdgeLinks = function(handle, form) {
        let currentFile = xelib.GetElementFile(handle);
        let currentForm = xelib.GetFormID(handle);
        let changed = false;
        service.withElements(handle, 'NVNM\\Edge Links', function(edgeLinks) {
            for (let i = edgeLinks.length - 1; i >= 0; i--) {
                if (form && xelib.GetUIntValue(edgeLinks[i], 'Mesh') !== form) continue;
                service.RemoveLinkedEdgeLinks(currentFile, currentForm, form, edgeLinks[i]);
                xelib.RemoveElement(edgeLinks[i]);
                changed = true;
            }
        });
        return changed;
    };

    this.UpdateMinMaxZ = function(handle) {
        var minZ = xelib.GetFloatValue(handle, 'NVNM\\Min Z');
        xelib.SetFloatValue(handle, 'NVNM\\Min Z', minZ - 30000.0);
        var maxZ = xelib.GetFloatValue(handle, 'NVNM\\Max Z');
        xelib.SetFloatValue(handle, 'NVNM\\Max Z', maxZ - 30000.0);
    };

    this.withReplacementNavmesh = function(handle, callback) {
        let container = xelib.GetContainer(handle);
        let navmeshes = xelib.GetRecords(container, 'NAVM', false);
        try {
            callback(navmeshes[0]);
        } finally {
            navmeshes.forEach(xelib.Release);
        }
    };

    this.hasReplacementNavmesh = function(handle) {
        let container = xelib.GetContainer(handle);
        let navmeshes = xelib.GetRecords(container, 'NAVM', false);
        navmeshes.forEach(xelib.Release);
        return navmeshes.length > 0;
    };

    this.intToHex = function(n, padding) {
        var str = Number(n).toString(16).toUpperCase();
        while (str.length < padding) {
            str = '0' + str;
        }
        return str;
    };

    this.HexFormID = function(handle) {
        return service.intToHex(xelib.GetFormID(handle), 8);
    };
});
