// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, ipcMain, protocol, BrowserWindow } from 'electron';
import createWindow from './helpers/window';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

let mainWindow, progressWindow, showProgressTimeout;

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== 'production') {
    let userDataPath = app.getPath('userData');
    app.setPath('userData', userDataPath + ' (' + env.name + ')');
}

let getPageUrl = function(page) {
    return url.format({
        pathname: path.join(__dirname, page),
        protocol: 'file:',
        slashes: true
    });
};

let loadPage = function(window, page, openDevTools) {
    if (openDevTools) {
        window.openDevTools();
        window.webContents.on('devtools-opened', function() {
            window.loadURL(getPageUrl(page));
        });
    } else {
        window.loadURL(getPageUrl(page));
    }
};

let mainSend = function(channel, ...args) {
    if (!mainWindow) return;
    mainWindow.webContents.send(channel, ...args);
};

let progSend = function(channel, ...args) {
    if (!progressWindow) return;
    progressWindow.webContents.send(channel, ...args);
};

let openMainWindow = function() {
    mainWindow = createWindow('main', { frame: false });
    loadPage(mainWindow, 'app.html', env.name === 'development');
};

let openProgressWindow = function() {
    progressWindow = new BrowserWindow({
        title: "zEdit Progress",
        show: false,
        frame: false,
        closable: false,
        transparent: true,
        focusable: false,
        maximizable: false,
        minimizable: false,
        resizable: false,
        movabale: false
    });
    loadPage(progressWindow, 'progress.html');
};

app.on('ready', function () {
    openMainWindow();
    openProgressWindow();
    mainWindow.on('closed', () => progressWindow.destroy());
});

app.on('window-all-closed', () => app.quit());

ipcMain.on('show-progress', (e, p) => {
    progressWindow.setBounds(mainWindow.getBounds());
    progSend('set-progress', p);
    showProgressTimeout = setTimeout(() => progressWindow.show(), 50);
});

ipcMain.on('hide-progress', () => {
    mainSend('progress-hidden');
    clearTimeout(showProgressTimeout);
    progressWindow.hide();
});

ipcMain.on('set-theme', (e, p) => progSend('set-theme', p));
ipcMain.on('progress-title', (e, p) => progSend('progress-title', p));
ipcMain.on('progress-message', (e, p) => progSend('progress-message', p));
ipcMain.on('add-progress', (e, p) => progSend('add-progress', p));
ipcMain.on('log-message', (e, p) => progSend('log-message', p));
ipcMain.on('allow-close', () => progSend('allow-close'));
