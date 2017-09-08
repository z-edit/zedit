import {lib, xelib} from './lib';
import {applyEnums, Fail, GetByte, GetHandle, GetString, wcb} from './helpers';

// ENUMERATIONS
const loaderStates = ['lsInactive', 'lsActive', 'lsDone', 'lsError'];
const gameModes = ['gmFNV', 'gmFO3', 'gmTES4', 'gmTES5', 'gmSSE', 'gmFO4'];

applyEnums(xelib, loaderStates, 'loaderStates');
applyEnums(xelib, gameModes, 'gameModes');

// CONSTANTS
xelib.games = [{
    name: 'Fallout NV',
    shortName: 'FalloutNV',
    mode: 0,
    exeName: 'FalloutNV.exe'
}, {
    name: 'Fallout 3',
    shortName: 'Fallout3',
    mode: 1,
    exeName: 'Fallout3.exe'
}, {
    name: 'Oblivion',
    shortName: 'Oblivion',
    mode: 2,
    exeName: 'Oblivion.exe'
}, {
    name: 'Skyrim',
    shortName: 'Skyrim',
    mode: 3,
    exeName: 'TESV.exe'
}, {
    name: 'Skyrim SE',
    shortName: 'Skyrim',
    mode: 4,
    exeName: 'SkyrimSE.exe'
}, {
    name: 'Fallout 4',
    shortName: 'Fallout4',
    mode: 5,
    exeName: 'Fallout4.exe'
}];

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
xelib.LoadPlugins = function(loadOrder, smartLoad = true) {
    if (!lib.LoadPlugins(wcb(loadOrder), smartLoad))
        Fail('Failed to load plugins.');
};
xelib.LoadPlugin = function(filename) {
    if (!lib.LoadPlugin(wcb(filename)))
        Fail(`Failed to load ${filename}`);
};
xelib.LoadPluginHeader = function(filename) {
    return GetHandle(function(_res) {
        if (!lib.LoadPluginHeader(wcb(filename), _res))
            Fail(`Failed to load plugin header for ${filename}`);
    });
};
xelib.UnloadPlugin = function(_id) {
    if (!lib.UnloadPlugin(_id))
        Fail(`Failed to unload plugin ${_id}`);
};
xelib.GetLoaderStatus = function() {
    return GetByte(function(_byte) {
        if (!lib.GetLoaderStatus(_byte))
            Fail('Failed to get loader status.');
    });
};
xelib.GetGamePath = function(gameMode) {
    return GetString(function(len) {
        lib.GetGamePath(gameMode, len);
    }) || '';
};
