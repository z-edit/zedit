ngapp.service('recordChangeService', function() {
    let objectTypes = [xelib.vtArray, xelib.vtStruct];

    let {WithEachHandle, GetElements, GetValue,
        LocalPath, Signature, ValueType} = xelib;

    // private
    let getSparseElements = function(id) {
        return GetElements(id, '', { sparse: true });
    };

    let withSparseElements = function(mst, ovr, callback) {
        WithEachHandle(getSparseElements(mst), mstElements => {
            WithEachHandle(getSparseElements(ovr), ovrElements => {
                callback(mstElements, ovrElements);
            });
        });
    };

    let elementCreated = function(changes, element) {
        changes.push({
            path: LocalPath(element),
            type: 'Created'
        });
    };

    let elementRemoved = function(changes, element) {
        changes.push({
            path: LocalPath(element),
            type: 'Removed'
        });
    };

    let elementChanged = function(changes, mstElement, ovrElement) {
        let vt = ValueType(element);
        if (objectTypes.includes(vt)) {
            getChanges(changes, mstElement, ovrElement);
        } else {
            let mstValue = GetValue(mstElement),
                ovrValue = GetValue(ovrElement);
            if (mstValue === ovrValue) return;
            changes.push({
                path: LocalPath(element),
                type: 'Changed',
                value: ovrValue
            });
        }
    };

    let getChanges = function(changes, mst, ovr) {
        withSparseElements(mst, ovr, (mstElements, ovrElements) => {
            ovrElements.forEach((ovrElement, index) => {
                let mstElement = mstElements[index],
                    ovrPresent = ovrElement !== 0,
                    mstPresent = mstElement !== 0;
                if (ovrPresent && !mstPresent)
                    elementCreated(changes, ovrElement);
                if (mstPresent && !ovrPresent)
                    elementRemoved(changes, mstElement);
                if (mstPresent && ovrPresent)
                    elementChanged(changes, mstElement, ovrElement);
            });
        });
    };

    // public
    this.getRecordChanges = function(mst, ovr) {
        if (Signature(ovr) !== Signature(mst)) return;
        let changes = [];
        getChanges(changes, mst, ovr);
        if (changes.length) return changes;
    };
});