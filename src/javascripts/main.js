// This is main process of Electron, started as first thing when your
// app starts. This script is running through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from 'path';
import url from 'url';
import { app, Menu, ipcMain, BrowserWindow } from 'electron';
import createWindow from './helpers/window';
//import _xelib from './xelib';

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from './env';

let mainWindow, backgroundWindow;

//global.xelib = _xelib;

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

let createBackgroundWindow = function() {
    const window = new BrowserWindow({ show: false });
    window.loadURL(`file://${__dirname}/background.html`);
    return window;
};

app.on('ready', function () {
    setApplicationMenu();

    let appUrl = url.format({
        pathname: path.join(__dirname, 'app.html'),
        protocol: 'file:',
        slashes: true
    });

    mainWindow = createWindow('main', { frame: false });
    backgroundWindow = createBackgroundWindow();

    if (env.name === 'development') {
        mainWindow.openDevTools();
        mainWindow.webContents.on('devtools-opened', function() {
            mainWindow.loadURL(appUrl);
        });
    } else {
        mainWindow.loadURL(appUrl);
    }
});

app.on('window-all-closed', function () {
    app.quit();
});

ipcMain.on('worker-response', function(event, payload) {
    mainWindow.webContents.send('worker-response', payload);
});

ipcMain.on('run-worker', function(event, payload) {
    backgroundWindow.webContents.send('run-worker', payload);
});