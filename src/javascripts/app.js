import 'angular';
import 'angular-ui-router';
import 'angular-spinner';
import 'angular-color-picker';
import 'angular-elastic-input';
import 'angular-marked';
import 'angular-vs-repeat';
import 'angularjs-scroll-glue';
import { remote, ipcRenderer, clipboard } from 'electron';
import jetpack from 'fs-jetpack';
import fh from './helpers/fileHelpers';
import Logger from './helpers/logger.js';
import { Ini } from 'ini-api';
import buildModuleService from './helpers/moduleService';
import './extensions';
import './color';

window.locale = remote.app.getLocale();
window.env = remote.getGlobal('env');
window.argv = remote.getGlobal('argv');
window.md5File = require('md5-file');
window.xelib = require('xelib').wrapper;
window.appVersion = remote.app.getVersion();

// init logger
let logger = new Logger();
logger.init('app');
logger.info(`zEdit v${appVersion} ${process.arch}`);
logger.addCallback('error', (msg) => window.alert(msg));
xelib.logger = logger;

// verbose logging
window.verbose = location.search.includes('verbose=1');
xelib.verbose = verbose;

// handle uncaught exceptions
window.startupCompleted = false;
process.on('uncaughtException', function(e) {
    if (window.startupCompleted) return;
    logger.error(`There was a critical error on startup:\n\n${e.stack}`);
    remote.app.quit();
});

// initialize xelib when application starts
try {
    const libPath = jetpack.path('XEditLib.dll');
    logger.info(`Initializing xelib with "${libPath}"`);
    xelib.Initialize(libPath);
    const libVersion = xelib.GetGlobal('Version');
    const libWorkingDir = xelib.GetGlobal('ProgramPath');
    logger.info(`xelib v${libVersion} initialized successfully`);
    logger.info(`xelib working directory: "${libWorkingDir}"`)
} catch (e) {
    logger.error(`There was a critical error loading XEditLib.dll:\n\n${e.stack}`);
    remote.app.quit();
}

// set up angular application
const ngapp = angular.module('zedit', [
    'ui.router', 'angularSpinner', 'vs-repeat', 'mp.colorPicker',
    'puElasticInput', 'hc.marked', 'luegg.directives'
]);

ngapp.config(function($urlMatcherFactoryProvider, $compileProvider) {
    // allow urls with and without trailing slashes to go to the same state
    $urlMatcherFactoryProvider.strictMode(false);
    // allow docs:// urls
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|docs):/);
});

ngapp.factory('$exceptionHandler', function($log) {
    return (exception, cause) => {
        logger.error(exception.stack);
        $log.error(exception, cause);
    };
});

// state redirects
ngapp.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (e, toState, params) {
        if (!toState.redirectTo) return;
        e.preventDefault();
        $state.go(toState.redirectTo, params, { location: 'replace' });
    });
}]);

//== begin angular files ==
//=include Directives/*.js
//=include Factories/*.js
//=include Filters/*.js
//=include Runners/**/*.js
//=include Services/**/*.js
//=include Views/**/*.js
//== end angular files ==

// load modules
const moduleService = buildModuleService(ngapp, fh, logger);
moduleService.loadModules();
ngapp.run(function($timeout, helpService) {
    $timeout(() => {
        moduleService.loadDeferredModules();
        moduleService.moduleDocs.forEach(({topic, path}) => {
            helpService.addTopic(topic, path);
        });
    }, 100);
});
