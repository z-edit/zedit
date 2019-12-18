ngapp.service('octokitService', function(downloadService, progressService) {
    let repoUrlExpr = /github\.com\/([^\/]+)\/([^\/]+)/,
        Octokit = require('@octokit/rest'),
        userAgent = `zEdit ${appVersion}`,
        octokit = Octokit({userAgent});

    let extractOwnerAndRepo = function(url) {
        let [,owner,repo] = url.match(repoUrlExpr);
        return {owner, repo};
    };

    let downloadProgress = function(asset, percent) {
        let message = `Downloading ${asset.name}... ${percent * 100}%`;
        progressService.progressMessage(message);
    };

    // service functions
    this.getLatestRelease = function(url) {
        return new Promise((resolve, reject) => {
            let options = extractOwnerAndRepo(url);
            octokit.repos.getLatestRelease(options).then(
                response => resolve(response.data),
                () => reject(
                    new Error(`Failed to get latest release from \n${url}`)
                )
            );
        });
    };

    this.downloadAsset = function(asset) {
        return downloadService.downloadFile(
            asset.browser_download_url,
            asset.name,
            ({percent}) => downloadProgress(asset, percent)
        );
    };
});
