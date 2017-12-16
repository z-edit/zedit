ngapp.service('mergeService', function(settingsService) {
    let getMergePath = function() {
        let mergePath = settingsService.settings.mergePath;
        fh.jetpack.dir(mergePath);
        return mergePath;
    };

    let getNewMergeName = function() {
        let mergeName = 'New Merge',
            counter = 1,
            mergePath = getMergePath(),
            directories = fh.getDirectories(mergePath).map(fh.getFileName);
        while (directories.includes(mergeName))
            mergeName = `New Merge ${++counter}`;
        return mergeName;
    };

    this.newMerge = function() {
        let mergeName = getNewMergeName();
        return {
            name: mergeName,
            filename: `${mergeName}.esp`,
            plugins: [],
            archives: [],
            faceDataFiles: [],
            voiceDataFiles: [],
            scriptFragments: [],
            stringFiles: [],
            translations: [],
            iniFiles: [],
            seqFiles: [],
            generalAssets: [],
            extractArchives: false,
            buildArchive: false,
            handleFaceData: true,
            handleVoiceData: true,
            handleScriptFragments: true,
            handleStringFiles: true,
            handleTranslations: true,
            handleIniFiles: true,
            handleSeqFiles: true,
            copyGeneralAssets: false
        }
    };
});