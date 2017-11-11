import { remote, ipcRenderer, clipboard } from 'electron';
import jetpack from 'fs-jetpack';
import './polyfills';
import './color';
import fh from './helpers/fileHelpers';
import env from './env';
import { wrapper } from 'xelib';
import buildModuleService from './helpers/moduleService';

// handle uncaught exceptions
window.startupCompleted = false;
process.on('uncaughtException', function(e) {
    if (window.startupCompleted) return;
    alert(`There was a critical error on startup:\n\n${e.stack}`);
    remote.app.quit();
});

// initialize xelib when application starts
window.xelib = wrapper;
try {
    const libPath = jetpack.path('XEditLib.dll');
    xelib.Initialize(libPath);
} catch (e) {
    alert(`There was a critical error loading XEditLib.dll:\n\n${e.stack}`);
    remote.getCurrentWindow().close();
}

// set up angular application
const ngapp = angular.module('zedit', [
    'ui.router', 'ct.ui.router.extras', 'angularSpinner', 'vs-repeat',
    'mp.colorPicker', 'puElasticInput', 'hc.marked'
]);

ngapp.config(function($urlMatcherFactoryProvider, $compileProvider) {
    // allow urls with and without trailing slashes to go to the same state
    $urlMatcherFactoryProvider.strictMode(false);
    // allow docs:// urls
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|file|docs):/);
});

// state redirects
ngapp.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (e, toState, params) {
        if (toState.redirectTo) {
            e.preventDefault();
            $state.go(toState.redirectTo, params, {location: 'replace'});
        }
    });
}]);

//== begin angular files ==
//=include Directives/*.js
//=include Factories/*.js
//=include Filters/*.js
//=include Services/*.js
//=include Views/**/*.js
//== end angular files ==

// load modules
const moduleService = buildModuleService(ngapp, fh);
moduleService.loadModules();
ngapp.run(function() {
    moduleService.loadDeferredModules();
    moduleService.getFailures().forEach(function(msg) {
        console.error(msg);
    });
});
