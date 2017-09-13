ngapp.service('themeService', function(settingsService) {
    let service = this,
        unknownMetaData = {
            author: 'Unknown',
            released: '?',
            updated: '?',
            description: 'This theme does not have embedded metadata.'
        };

    this.getThemes = function() {
        let themes = fh.appDir.find('app\\themes', { matching: '*.css' });
        return themes.map(function(theme) {
            let fileContents = fh.appDir.read(theme),
                filename = theme.split('\\').last(),
                defaultMetaData = Object.assign(unknownMetaData, {
                    name: filename.match(/(.*)\.css/)[1]
                }),
                match = fileContents.match(new RegExp(/^\/\*\{([\w\W]+)\}\*\//)),
                metaData = defaultMetaData;
            try {
                if (match) metaData = JSON.parse(`{${match[1]}}`);
            } catch (x) {
                console.log(`Error parsing metadata for theme ${filename}: ${x.message}`);
            }
            metaData.filename = filename;
            return metaData;
        });
    };

    this.getCurrentTheme = function() {
        let settingsTheme = settingsService.globalSettings.theme;
        if (!settingsTheme || !fh.appDir.exists(`app\\themes\\${settingsTheme}`)) {
            let availableThemes = service.getThemes();
            return availableThemes[0].filename;
        }
        return settingsTheme;
    };
});
