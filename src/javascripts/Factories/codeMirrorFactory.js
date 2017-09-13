ngapp.service('codeMirrorFactory', function(themeService) {
    let options = {
            js: {
                lineNumbers: true,
                mode: 'javascript'
            },

            html: {
              lineNumbers: true,
              mode: 'htmlmixed'
            }
        };

    this.getOptions = function(label) {
        let opts = options[label],
            filename = themeService.getCurrentSyntaxTheme();
        opts.theme = themeService.extractThemeName(filename, 'default');
        return opts;
    };
});
