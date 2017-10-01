import { ipcRenderer } from 'electron';
import './polyfills';

// angular app initialization
const ngapp = angular.module('progress', ['vs-repeat', 'luegg.directives', 'angularSpinner']);

//== begin angular assets ==
//=require Factories/spinnerFactory.js
//=require Services/modalService.js
//=require Directives/progressBar.js
//=require Directives/progressModal.js
//=require Directives/loader.js
//== end angular assets ==

ngapp.run(function($rootScope, spinnerFactory) {
    let themeStylesheet = document.getElementById('theme');

    $rootScope.progress = {
        determinate: false,
        message: '...'
    };

    $rootScope.spinnerOpts = spinnerFactory.inverseOptions;

    $rootScope.$on('closeModal', () => {
        if ($rootScope.progress.canClose) ipcRenderer.send('hide-progress');
    });

    ipcRenderer.on('set-theme', function(e, payload) {
        themeStylesheet.href = payload;
    });

    ipcRenderer.on('set-progress', (e, payload) => {
        if (!payload) return;
        $rootScope.$applyAsync(() => $rootScope.progress = payload);
    });

    ipcRenderer.on('allow-close', () => {
        $rootScope.$applyAsync(() => $rootScope.progress.canClose = true);
    });

    ipcRenderer.on('progress-title', (e, payload) => {
        $rootScope.$applyAsync(() => $rootScope.progress.title = payload);
    });

    ipcRenderer.on('progress-message', (e, payload) => {
        $rootScope.$applyAsync(() => $rootScope.progress.message = payload);
    });

    ipcRenderer.on('add-progress', (e, payload) => {
        $rootScope.$applyAsync(() => $rootScope.progress.current += payload);
    });

    ipcRenderer.on('log-message', (e, payload) => {
        if (!$rootScope.progress.log) return;
        $rootScope.$applyAsync(() => {
            $rootScope.progress.log.push({
                message: payload[0],
                level: payload[1]
            });
        });
    });
});
