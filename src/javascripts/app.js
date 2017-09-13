import { remote, ipcRenderer } from 'electron';
import jetpack from 'fs-jetpack';
import './polyfills';
import './color';
import fh from './helpers/fileHelpers';
import env from './env';
import './xelib';
import buildModuleService from './helpers/moduleService';

// initialize xelib when application starts
xelib.Initialize();

// set up angular application
const ngapp = angular.module('zedit', [
    'ui.router', 'ct.ui.router.extras', 'angularSpinner', 'vs-repeat',
    'mp.colorPicker', 'puElasticInput'
]);

//this allows urls with and without trailing slashes to go to the same state
ngapp.config(function($urlMatcherFactoryProvider) {
    $urlMatcherFactoryProvider.strictMode(false);
});

// state redirects
ngapp.run(['$rootScope', '$state', function($rootScope, $state) {
    $rootScope.$on('$stateChangeStart', function (evt, toState, params, fromState) {
        if (toState.redirectTo) {
            evt.preventDefault();
            $state.go(toState.redirectTo, params, {location: 'replace'});
        }
    });
}]);

//= concat_tree ./Directives
//= concat_tree ./Factories
//= concat_tree ./Filters
//= concat_tree ./Services
//= concat_tree ./Views

// load modules
const moduleService = buildModuleService(ngapp, fh);
moduleService.loadModules();
ngapp.run(() => moduleService.loadDeferredModules());
