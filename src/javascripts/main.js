// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, ipcMain, BrowserWindow } from 'electron';
import createWindow from './helpers/window';
import _xelib from './xelib';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

let mainWindow, backgroundWindow;

global.xelib = _xelib;

let setApplicationMenu = function () {
    Menu.setApplicationMenu(Menu.buildFromTemplate([]));
};

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

let loadPage = function(window, page) {
    if (env.name === 'development') {
        window.openDevTools();
        window.webContents.on('devtools-opened', function() {
            window.loadURL(getPageUrl(page));
        });
    } else {
        window.loadURL(getPageUrl(page));
    }
};

app.on('ready', function () {
    setApplicationMenu();

    mainWindow = createWindow('main', { frame: false });
    backgroundWindow = new BrowserWindow({
        show: env.name !== 'development'
    });

    loadPage(mainWindow, 'app.html');
    loadPage(backgroundWindow, 'background.html');
});

app.on('window-all-closed', function () {
    app.quit();
});

ipcMain.on('worker-message', function(e, message) {
    mainWindow.webContents.send('worker-message', message);
});

ipcMain.on('worker-callback', function(e, payload) {
    mainWindow.webContents.send('worker-callback', payload);
});

ipcMain.on('worker-done', function(e, payload) {
    mainWindow.webContents.send('worker-done', payload);
});

ipcMain.on('worker-error', function(e, payload) {
    mainWindow.webContents.send('worker-error', payload);
});

ipcMain.on('run-worker', function(e, payload) {
    console.log(`run-worker: ${payload}`);
    backgroundWindow.webContents.send('run-worker', payload);
});