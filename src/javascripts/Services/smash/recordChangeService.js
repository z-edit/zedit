ngapp.service('recordChangeService', function(settingsService, xelibService) {
    let {WithHandles, GetElements, GetEnabledFlags,
        GetValue, SortKey, GetHexFormID, Name, PathName,
        Signature, ValueType, IsSorted,
        vtFlags, vtReference, vtArray, vtStruct} = xelib;

    let objectTypes = [vtArray, vtStruct];

    let valueFunctions = {
        [vtFlags]: function(element) {
            try {
                return GetEnabledFlags(element).join(',');
            } catch (x) {
                return GetValue(element);
            }
        },
        [vtReference]: xelibService.getReferenceValue
    };

    // private
    let skipRecord = function(sig) {
        let {recordsToSkip} = settingsService.settings.smash;
        return recordsToSkip.includes(sig);
    };

    let getSparseElements = function(id) {
        return GetElements(id, '', { sparse: true });
    };

    let getSortFn = function(sortedKeys) {
        return (obj, element) => {
            let sortKey = SortKey(element);
            sortedKeys.add(sortKey);
            obj[sortKey] = element;
            return obj;
        };
    };

    let sortElements = function(mstElements, ovrElements) {
        let sortedKeys = new Set(),
            sortFn = getSortFn(sortedKeys),
            mstSorted = mstElements.reduce(sortFn, {}),
            ovrSorted = ovrElements.reduce(sortFn, {});
        mstElements.length = sortedKeys.size;
        ovrElements.length = sortedKeys.size;
        Array.from(sortedKeys).sort().forEach((sortKey, index) => {
            mstElements[index] = mstSorted[sortKey] || 0;
            ovrElements[index] = ovrSorted[sortKey] || 0;
        });
    };

    let filterRH = function(elements) {
        let {recordHeaderRules} = settingsService.settings.smash;
        return elements.filter(element => {
            return recordHeaderRules[Name(element)];
        });
    };

    let isRecordHeader = function(element) {
        return Name(element) === 'Record Header';
    };

    let padElements = function(mstElements, ovrElements) {
        while (mstElements.length < ovrElements.length)
            mstElements.push(0);
        while (ovrElements.length < mstElements.length)
            ovrElements.push(0);
    };

    let withSparseElements = function(mst, ovr, callback) {
        WithHandles(getSparseElements(mst), mstElements => {
            WithHandles(getSparseElements(ovr), ovrElements => {
                IsSorted(mst)
                    ? sortElements(mstElements, ovrElements)
                    : padElements(mstElements, ovrElements);
                isRecordHeader(mst)
                    ? callback(filterRH(mstElements), filterRH(ovrElements))
                    : callback(mstElements, ovrElements);
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

    let handleValueChanged = function(changes, mstElement, ovrElement, vt) {
        let getValueFn = valueFunctions[vt] || GetValue,
            mstValue = getValueFn(mstElement),
            ovrValue = getValueFn(ovrElement);
        if (mstValue === ovrValue) return;
        changes.push({
            key: PathName(ovrElement),
            type: 'Changed',
            value: ovrValue
        });
    };

    let elementChanged = function(changes, mstElement, ovrElement) {
        let vt = ValueType(ovrElement);
        if (objectTypes.includes(vt)) {
            handleNestedChanges(changes, mstElement, ovrElement);
        } else {
            handleValueChanged(changes, mstElement, ovrElement, vt);
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
        if (skipRecord(sig) || sig !== Signature(mst)) return;
        let changes = [];
        getChanges(changes, mst, ovr);
        if (changes.length) return {
            formId: GetHexFormID(mst, true),
            sig: sig,
            changes: changes
        };
    };
});
