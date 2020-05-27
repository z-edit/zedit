ngapp.service('seqService', function(progressLogger) {
    const seqFlag = 'Start Game Enabled';

    let isSEQ = function(rec) {
        return xelib.HasElement(rec, 'DNAM\\Flags') &&
            xelib.GetFlag(rec, 'DNAM\\Flags', seqFlag);
    };

    let masterIsSEQ = function(rec) {
        return xelib.WithHandle(xelib.GetMasterRecord(rec), m => {
            return isSEQ(m);
        });
    };

    let masterIsMerged = function(rec, merge) {
        if (merge.method === 'Clean') return xelib.IsMaster(rec);
        return xelib.WithHandle(xelib.GetMasterRecord(rec), m => {
            return xelib.WithHandle(xelib.GetElementFile(m), f => {
                let masterName = xelib.Name(f);
                return merge.plugins.contains(plugin => {
                    return plugin.filename === masterName;
                });
            });
        });
    };

    let getSeqQuests = function(merge) {
        let questGroup = xelib.GetElement(merge.plugin, 'QUST'),
            masterCount = xelib.GetMasterNames(merge.plugin).length,
            formIds = [];
        if (!questGroup) return formIds;
        xelib.WithEachHandle(xelib.GetElements(questGroup), qust => {
            if (!isSEQ(qust)) return;
            let fid = xelib.GetFormID(qust, true);
            if (masterIsMerged(qust, merge)) {
                fid = fid % 0x1000000 + masterCount * 0x1000000;
            } else if (masterIsSEQ(qust)) return;
            formIds.push(fid);
        });
        return formIds;
    };

    this.buildSeqFile = function(merge) {
        let formIds = getSeqQuests(merge);
        if (!formIds.length) return;
        let filename = fh.getFileBase(merge.filename) + '.seq',
            filePath = `${merge.dataPath}\\seq\\${filename}`,
            buffer = new Buffer(formIds.length * 4);
        formIds.forEach((fid, n) => buffer.writeUInt32LE(fid, n * 4));
        fh.jetpack.write(filePath, buffer);
        progressLogger.log('Created SEQ file: ' + filePath);
    };
});
