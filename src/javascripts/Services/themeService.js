ngapp.service('themeService', function(settingsService) {
    let service = this,
        unknownMetaData = {
            author: 'Unknown',
            released: '?',
            updated: '?',
            description: 'This theme does not have embedded metadata.'
        };

    this.extractThemeName = function(filename, defaultName = '') {
        let match = filename.match(/(.*)\.css/);
        return match ? match[1] : defaultName;
    };

    this.getThemes = function() {
        let themes = fh.appDir.find('app\\themes', { matching: '*.css' });
        return themes.map(function(theme) {
            let fileContents = fh.appDir.read(theme),
                filename = theme.split('\\').last(),
                defaultMetaData = Object.assign(unknownMetaData, {
                    name: service.extractThemeName(filename)
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

    this.getSyntaxThemes = function() {
        let themes = fh.appDir.find('app\\syntaxThemes', { matching: '*.css' });
        return themes.map(function(theme) {
            let filename = theme.split('\\').last();
            return {
                filename: filename,
                name: service.extractThemeName(filename)
            };
        });
    };

    this.getCurrentTheme = function() {
        let settingsTheme = settingsService.globalSettings.theme,
            themePath = `app\\themes\\${settingsTheme}`;
        if (!settingsTheme || !fh.appDir.exists(themePath)) {
            let availableThemes = service.getThemes();
            return availableThemes[0].filename;
        }
        return settingsTheme;
    };

    this.getCurrentSyntaxTheme = function() {
        let settingsTheme = settingsService.globalSettings.syntaxTheme,
            themePath = `app\\syntaxThemes\\${settingsTheme}`;
        if (!settingsTheme || !fh.appDir.exists(themePath)) {
            return '';
        }
        return settingsTheme;
    };
});
