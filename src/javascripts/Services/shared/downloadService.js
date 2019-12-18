ngapp.service('downloadService', function() {
    let fs = require('fs');

    let request = require('request'),
        progress = require('request-progress');

    this.downloadFile = function(url, filename, onProgress) {
        let filePath = fh.userDir.dir('downloads').path(filename);
        return new Promise((resolve, reject) => {
            progress(request(url))
                .on('progress', onProgress)
                .on('error', reject)
                .on('end', () => resolve(filePath))
                .pipe(fs.createWriteStream(filePath));
        });
    };
});
