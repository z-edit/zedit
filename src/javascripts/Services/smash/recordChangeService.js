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

    let elementCreated = function(changes, ovrElement) {
        changes.push({
            path: LocalPath(ovrElement),
            type: 'Created'
        });
    };

    let elementRemoved = function(changes, mstElement) {
        changes.push({
            path: LocalPath(mstElement),
            type: 'Removed'
        });
    };

    let elementChanged = function(changes, mstElement, ovrElement) {
        let vt = ValueType(ovrElement);
        if (objectTypes.includes(vt)) {
            getChanges(changes, mstElement, ovrElement);
        } else {
            let mstValue = GetValue(mstElement),
                ovrValue = GetValue(ovrElement);
            if (mstValue === ovrValue) return;
            changes.push({
                path: LocalPath(ovrElement),
                type: 'Changed',
                value: ovrValue // TODO: handle reference fields
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
                    elementCreated(changes, ovrElement, index);
                if (mstPresent && !ovrPresent)
                    elementRemoved(changes, mstElement, index);
                if (mstPresent && ovrPresent)
                    elementChanged(changes, mstElement, ovrElement);
            });
        });
    };

    // public
    this.getRecordChanges = function(mst, ovr) {
        let sig = Signature(ovr);
        if (sig !== Signature(mst)) return;
        let changes = [];
        getChanges(changes, mst, ovr);
        if (changes.length) return {
            formId: xelib.GetHexFormID(mst, true),
            sig: sig,
            changes: changes
        };
    };
});