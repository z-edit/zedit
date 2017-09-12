import { ipcRenderer } from 'electron';
import './polyfills';

// angular app initialization
const ngapp = angular.module('progress', ['vs-repeat', 'luegg.directives', 'angularSpinner']);

//= concat ./Factories/spinnerFactory.js
//= concat ./Services/modalService.js
//= concat ./Directives/progressBar.js
//= concat ./Directives/progressModal.js
//= concat ./Directives/loader.js

ngapp.run(function($rootScope, spinnerFactory) {
    $rootScope.progress = {
        determinate: false,
        message: '...'
    };

    $rootScope.whiteOpts = spinnerFactory.whiteOptions;

    $rootScope.$on('unfocus-modal', () => {
        if ($rootScope.progress.canClose) ipcRenderer.send('hide-progress');
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