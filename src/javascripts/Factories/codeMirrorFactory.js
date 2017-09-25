ngapp.service('codeMirrorFactory', function(themeService) {
    let options = {
        js: { mode: 'javascript' },
        html: { mode: 'htmlmixed' }
    };

    this.getOptions = function(label, readOnly = false) {
        let filename = themeService.getCurrentSyntaxTheme();
        return Object.assign({}, options[label], {
            theme: themeService.extractThemeName(filename, 'default'),
            lineNumbers: !readOnly,
            readOnly: readOnly,
            scrollbarStyle: readOnly ? null : 'native',
            lineWrapping: true
        });
    };
});
