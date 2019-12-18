ngapp.service('extensionRegistry', function($http, progressService, octokitService, extensionService) {
    let {getLatestRelease, downloadAsset} = octokitService,
        {progressMessage} = progressService;

    let domainUrl = 'https://raw.githubusercontent.com',
        baseUrl = `${domainUrl}/z-edit/zedit-registry/master`,
        resources = {};

    // helper functions
    let retrieveResource = function(filename) {
        return $http.get(`${baseUrl}/${filename}`).then(response => {
            return response.data;
        });
    };

    let getResource = function(filename) {
        if (!resources.hasOwnProperty(filename))
            resources[filename] = retrieveResource(filename);
        return resources[filename];
    };

    let releaseAssetsValid = function(release) {
        return release.assets.length === 1 &&
            fh.getFileExt(release.assets[0].name) === 'zip';
    };

    // service functions
    this.retrieveModules = function() {
        return getResource('modules.json');
    };

    this.retrieveThemes = function() {
        return getResource('themes.json');
    };

    this.installModule = async function(module) {
        progressMessage(`Getting release information for ${module.name}`);
        let release = await getLatestRelease(module.links.github);
        if (!releaseAssetsValid(release))
            throw new Error('GitHub release must have exactly one .zip ' +
                'archive to be installed automatically.');
        module.version = release.tag_name;
        let [asset] = release.assets;
        progressMessage(`Downloading ${asset.name}...`);
        let archiveFilePath = await downloadAsset(asset),
            filename = fh.getFileName(archiveFilePath);
        progressMessage(`Installing module from ${filename}`);
        extensionService.installModule(archiveFilePath);
        return module;
    };
});
