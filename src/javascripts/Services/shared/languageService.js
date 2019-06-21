ngapp.service('languageService', function() {
    let localesPath = fh.path(fh.appPath, 'locales.json'),
        locales = fh.loadJsonFile(localesPath) || {};

    let languages = ['English', 'French', 'German', 'Italian', 'Spanish',
        'Russian', 'Polish', 'Japanese', 'Portugese', 'Chinese'];

    let getSystemLanguage = function() {
        let localeLanguage = locales[window.locale];
        return localeLanguage.replace(/\s\([^)]+\)/, '');
    };

    // PUBLIC API
    this.getLanguages = function() {
        return languages.slice();
    };

    this.getDefaultLanguage = function() {
        let systemLanguage = getSystemLanguage(),
            languageSupported = languages.includes(systemLanguage);
        return languageSupported ? systemLanguage : 'English';
    };
});
