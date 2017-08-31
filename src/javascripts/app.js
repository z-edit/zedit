import { remote } from 'electron';
import jetpack from 'fs-jetpack';
import './polyfills.js';
import './color.js';
import fh from './helpers/fileHelpers.js';
import env from './env';
import xelib from './xelib.js';

// initialize xelib when application starts
xelib.Initialize();

// set up angular application
var ngapp = angular.module('application', [
    'ui.router', 'ct.ui.router.extras', 'angularSpinner', 'vs-repeat', 'mp.colorPicker'
]);

//this allows urls with and without trailing slashes to go to the same state
ngapp.config(function ($urlMatcherFactoryProvider) {
    $urlMatcherFactoryProvider.strictMode(false);
});

// state redirects
ngapp.run(['$rootScope', '$state', function ($rootScope, $state) {
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