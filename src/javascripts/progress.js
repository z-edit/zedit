import { ipcRenderer } from 'electron';
import './polyfills';
import logger from './helpers/logger.js';

// angular app initialization
const ngapp = angular.module('progress', ['vs-repeat', 'luegg.directives', 'angularSpinner']);

//== begin angular assets ==
//=include Directives/progressBar.js
//=include Directives/progressModal.js
//=include Directives/loader.js
//=include Factories/spinnerFactory.js
//=include Services/Shared/modalService.js
//== end angular assets ==

ngapp.run(function($rootScope, $timeout, spinnerFactory) {
    // initialization
    let themeStylesheet = document.getElementById('theme');
    $rootScope.spinnerOpts = spinnerFactory.inverseOptions;
    $rootScope.progress = {
        determinate: false,
        message: '...'
    };

    // logging stuff
    let getMessageClass = msg => {
        let n = msg[0] === '[' && msg.indexOf(']');
        if (n <= 0) return 'log';
        return `${msg.slice(1, n).toLowerCase()}`;
    };

    let buildMessageObj = msg => ({
        text: msg.trimRight(),
        class: getMessageClass(msg)
    });

    let apply = fn => {
        return (...args) => $rootScope.$applyAsync(() => fn(...args));
    };

    let initLog = progress => {
        progress.log = [];
        logger.init(progress.logName || 'progress');
    };

    // event handlers
    $rootScope.$on('closeModal', () => {
        if (!$rootScope.progress.canClose) return;
        ipcRenderer.send('hide-progress');
    });

    logger.addCallback('log', apply(msg => {
        if (!$rootScope.progress.log) return;
        $rootScope.progress.log.push(buildMessageObj(msg));
    }));

    ipcRenderer.on('progress-hidden', () => logger.close());
    ipcRenderer.on('log-message', (e, [level, msg]) => logger[level](msg));

    ipcRenderer.on('progress-error', (e, msg) => {
        $timeout(() => {
            $rootScope.progress.error = true;
            logger.error(msg);
            alert(msg);
        }, 100);
    });

    ipcRenderer.on('set-theme', (e, href) => {
        themeStylesheet.href = href;
    });

    ipcRenderer.on('set-progress', (e, progress) => {
        if (!progress) return;
        if (progress.determinate) initLog(progress);
        $rootScope.progress = progress;
    });

    ipcRenderer.on('allow-close', apply(() => {
        let p = $rootScope.progress;
        p.canClose = true;
        p.complete = p.current === p.max;
    }));

    ipcRenderer.on('progress-title', apply((e, title) => {
        $rootScope.progress.title = title;
    }));

    ipcRenderer.on('progress-message', apply((e, msg) => {
        $rootScope.progress.message = msg;
    }));

    ipcRenderer.on('add-progress', apply((e, n) => {
        $rootScope.progress.current += n;
    }));
});
