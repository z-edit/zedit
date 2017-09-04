ngapp.service('themeService', function() {
    let unknownMetaData = {
        author: 'Unknown',
        released: '?',
        updated: '?',
        description: 'This theme does not have embedded metadata.'
    };

    this.getThemes = function() {
        let themes = fh.appDir.find('themes', { matching: '*.css' });
        return themes.map(function(theme) {
            let fileContents = fh.jetpack.read(theme),
                filename = theme.split('\\')[0],
                defaultMetaData = Object.assign(unknownMetaData, {
                    name: filename.match(/(.*)\.css/)[1]
                }),
                match = fileContents.match(new RegExp('^\/\*\{([\w\W]+)\}\*\/')),
                metaData = match ? JSON.parse(`{${match[1]}}`) : defaultMetaData;
            metaData.filename = filename;
            return metaData;
        });
    };
});