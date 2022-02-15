let cUtils = {};

cUtils.findValueInMapByLoweredKey = function (mapping, key) {
    if (mapping && key) {
        let res = Object.entries(mapping).find(kv => kv[0] && kv[0].toString().toLowerCase() === key.toLowerCase());
        if (res) {
            return res[1];
        }
    }
    return undefined;
}

export default cUtils;
