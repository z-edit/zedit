ngapp.service('seqService', function(mergeLogger) {
    const seqFlag = 'Start Game Enabled';

    let isSEQ = function(rec) {
        return xelib.GetFlag(rec, 'DNAM\\Flags', seqFlag);
    };

    let masterIsSEQ = function(rec) {
        return xelib.WithHandle(xelib.GetMasterRecord(rec), m => {
            return isSEQ(m);
        });
    };

    let getSeqQuests = function(plugin) {
        let questGroup = xelib.GetElement(plugin, 'QUST'),
            formIds = [];
        if (!questGroup) return formIds;
        xelib.WithEachHandle(xelib.GetElements(questGroup), qust => {
            if (!isSEQ(qust)) return;
            if (xelib.IsOverride(qust) && !masterIsSEQ(qust)) return;
            formIds.push(xelib.GetFormID(qust, true));
        });
        return formIds;
    };

    this.buildSeqFile = function(merge) {
        let formIds = getSeqQuests(merge.plugin);
        if (!formIds.length) return;
        let filename = fh.getFileBase(merge.filename) + '.seq',
            filePath = `${merge.dataPath}\\seq\\${filename}`,
            buffer = new Buffer(formIds.length * 4);
        formIds.forEach((fid, n) => buffer.writeUInt32LE(fid, n * 4));
        fh.jetpack.write(filePath, buffer);
        mergeLogger.log('Created SEQ file: ' + filePath);
    };
});