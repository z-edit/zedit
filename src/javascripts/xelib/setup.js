// LOADING AND SET UP METHODS
xelib.SetGamePath = function(gamePath) {
    if (!lib.SetGamePath(wcb(gamePath)))
        Fail(`Failed to set game path to ${gamePath}`);
};
xelib.SetLanguage = function(language) {
    if (!lib.SetLanguage(wcb(language)))
        Fail(`Failed to set language to ${language}`);
};
xelib.SetGameMode = function(gameMode) {
    if (!lib.SetGameMode(gameMode))
        Fail(`Failed to set game mode to ${gameMode}`);
};
xelib.GetLoadOrder = function() {
    return GetString(function(_len) {
        if (!lib.GetLoadOrder(_len))
            Fail('Failed to get load order');
    });
};
xelib.GetActivePlugins = function() {
    return GetString(function(_len) {
        if (!lib.GetActivePlugins(_len))
            Fail('Failed to get active plugins');
    });
};
xelib.LoadPlugins = function(loadOrder) {
    if (!lib.LoadPlugins(wcb(loadOrder)))
        Fail('Failed to load plugins.');
};
xelib.GetLoaderDone = function() {
    return lib.GetLoaderDone();
};
xelib.GetGamePath = function(gameMode) {
    return GetString(function(len) {
        lib.GetGamePath(gameMode, len);
    }) || '';
};