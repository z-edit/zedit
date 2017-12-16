ngapp.service('navmeshHelpers', function() {
    const buryDepth = 30000.0;

    // PRIVATE HELPER FUNCTIONS
    let withOverride = function(record, file, callback) {
        let override = xelib.AddElement(file, xelib.GetHexFormID(record));
        if (!callback(override)) xelib.RemoveElement(override);
    };

    let withNavmeshSiblings = function(navmesh, callback) {
        xelib.WithHandle(xelib.GetContainer(navmesh), function(container) {
            xelib.WithHandles(xelib.GetRecords(container, 'NAVM'), callback);
        });
    };

    let moveVerticesUnderground = function(handle) {
        let element = xelib.GetElement(handle, 'NVNM\\Vertices');
        xelib.WithHandle(element, function(vertices) {
            for (let i = 0; i < xelib.ElementCount(vertices); i++) {
                let z = xelib.GetFloatValue(vertices, `[${i}]\\Z`);
                xelib.SetFloatValue(vertices, `[${i}]\\Z`, z - buryDepth);
            }
        });
    };

    let removeEdgeLinkFlag = function(flags, triangle, ordinal, path) {
        if (flags & ordinal) {
            xelib.SetIntValue(triangle, path, -1);
            return flags - ordinal;
        }
        return flags;
    };

    let removeEdgeLinkFlags = function(triangle) {
        let flags = xelib.GetUIntValue(triangle, `Flags`),
            originalFlags = flags;
        flags = removeEdgeLinkFlag(flags, triangle, 1, 'Edge 0-1');
        flags = removeEdgeLinkFlag(flags, triangle, 2, 'Edge 1-2');
        flags = removeEdgeLinkFlag(flags, triangle, 4, 'Edge 2-0');
        if (flags !== originalFlags) {
            xelib.SetUIntValue(triangle, `Flags`, flags);
            return true;
        }
    };

    let removeLinkedEdgeLinks = function(file, navmForm, form, edgeLink) {
        let linkedMesh = xelib.GetLinksTo(edgeLink, 'Mesh');
        xelib.WithHandle(linkedMesh, function(mesh) {
            if (xelib.HasElement(file, xelib.GetHexFormID(mesh))) return;
            withOverride(mesh, file, function(override) {
                let triangle = xelib.GetIntValue(edgeLink, 'Triangle'),
                    changed = false,
                    trianglePath = `NVNM\\Triangles\\[${triangle}]`,
                    element = xelib.GetElement(override, trianglePath);
                xelib.WithHandle(element, function(meshTriangle) {
                    changed = removeEdgeLinkFlags(meshTriangle) || changed;
                });
                if (!form) return changed;
                return removeEdgeLinks(override, navmForm) || changed;
            });
        });
    };

    let removeEdgeLink = function(file, navmForm, form, edgeLink) {
        if (form && xelib.GetUIntValue(edgeLink, 'Mesh') !== form) return;
        removeLinkedEdgeLinks(file, navmForm, form, edgeLink);
        xelib.RemoveElement(edgeLink);
        return true;
    };

    let removeEdgeLinks = function(handle, form) {
        let changed = false;
        xelib.WithHandle(xelib.GetElementFile(handle), function(file) {
            let navmForm = xelib.GetFormID(handle),
                elements = xelib.GetElements(handle, 'NVNM\\Edge Links');
            xelib.WithHandles(elements, function(edgeLinks) {
                for (let i = edgeLinks.length - 1; i >= 0; i--) {
                    if (removeEdgeLink(file, navmForm, form, edgeLinks[i])) {
                        changed = true;
                    }
                }
            });
        });
        return changed;
    };

    let updateMinMaxZ = function(handle) {
        let minZ = xelib.GetFloatValue(handle, 'NVNM\\Min Z'),
            maxZ = xelib.GetFloatValue(handle, 'NVNM\\Max Z');
        xelib.SetFloatValue(handle, 'NVNM\\Min Z', minZ - buryDepth);
        xelib.SetFloatValue(handle, 'NVNM\\Max Z', maxZ - buryDepth);
    };

    // PUBLIC API
    this.hasReplacementNavmesh = function(handle) {
        let result = false;
        withNavmeshSiblings(handle, function(navmeshes) {
            result = navmeshes.length > 0;
        });
        return result;
    };

    this.withReplacementNavmesh = function(handle, callback) {
        withNavmeshSiblings(handle, function(navmeshes) {
            callback(navmeshes[0]);
        });
    };

    this.bury = function(navmesh) {
        moveVerticesUnderground(navmesh);
        removeEdgeLinks(navmesh);
        updateMinMaxZ(navmesh);
    };
});
