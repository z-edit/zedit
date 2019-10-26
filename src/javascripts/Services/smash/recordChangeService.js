ngapp.service('recordChangeService', function() {
    let objectTypes = [xelib.vtArray, xelib.vtStruct];

    let {WithHandles, GetElements, GetValue,
        PathName, Signature, ValueType} = xelib;

    // private
    let getSparseElements = function(id) {
        return GetElements(id, '', { sparse: true });
    };

    let withSparseElements = function(mst, ovr, callback) {
        WithHandles(getSparseElements(mst), mstElements => {
            WithHandles(getSparseElements(ovr), ovrElements => {
                callback(mstElements, ovrElements);
            });
        });
    };

    let elementCreated = function(changes, ovrElement) {
        changes.push({
            key: PathName(ovrElement),
            type: 'Created'
        });
    };

    let elementRemoved = function(changes, mstElement) {
        changes.push({
            key: PathName(mstElement),
            type: 'Removed'
        });
    };

    let handleNestedChanges = function(changes, mstElement, ovrElement) {
        let nestedChanges = [];
        getChanges(nestedChanges, mstElement, ovrElement);
        if (nestedChanges.length === 0) return;
        changes.push({
            key: PathName(ovrElement),
            type: "Changed",
            changes: nestedChanges
        });
    };

    let handleValueChanged = function(changes, mstElement, ovrElement) {
        let mstValue = GetValue(mstElement),
            ovrValue = GetValue(ovrElement);
        if (mstValue === ovrValue) return;
        changes.push({
            key: PathName(ovrElement),
            type: 'Changed',
            value: ovrValue // TODO: handle reference fields
        });
    };

    let elementChanged = function(changes, mstElement, ovrElement, parentVt) {
        let vt = ValueType(ovrElement);
        if (objectTypes.includes(vt)) {
            handleNestedChanges(changes, mstElement, ovrElement, parentVt);
        } else {
            handleValueChanged(changes, mstElement, ovrElement, parentVt);
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
