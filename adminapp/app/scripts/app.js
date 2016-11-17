'use strict';

/**
 * @ngdoc overview
 * @name adminPageApp
 * @description
 * # adminPageApp
 *
 * Main module of the application.
 */
angular
.module('adminPageApp', [
    'ngAnimate', 
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'ui.grid',
    'ui.grid.edit',
    'ui.grid.selection',
    'ui.bootstrap',
    'ui.grid.infiniteScroll',
    'ui.grid.autoResize',
    'ui.router',
    'ui.bootstrap.dropdown',
    'ui.select',
    'color.picker'
])
.constant('CONFIG', {
    viewDir: 'views/',
    limit: 20,
    tableauImagesPath: '../PreviewImages/',
    API: {
        useMocks: false,
        fakeDelay: 800,
        // baseUrl: 'http://bipdurdev01.corp.emc.com/',
        baseUrl: '/'
    }
})
.config(function (CONFIG, $provide) {
    //Only load mock data, if config says so
    if (!CONFIG.API.useMocks) {
        return;
    }
    //Decorate backend with awesomesauce
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
})
.config(function (CONFIG, $httpProvider) {
    $httpProvider.interceptors.push(function ($q, $timeout, CONFIG, $log, $rootScope) {
        /**
         * Function which add new params to url 
         * To avoid caching in IE get request.
         */
        function addUrlParam(url, key, value) {
            var newParam = key + '=' + value;
            var result = url.replace(new RegExp('(&|\\?)' + key + '=[^\&|#]*'), '$1' + newParam);
            if (result === url) {
                result = (url.indexOf('?') !== -1 ? url.split('?')[0] + '?' + newParam + '&' + url.split('?')[1]
                        : (url.indexOf('#') !== -1 ? url.split('#')[0] + '?' + newParam + '#' + url.split('#')[1]
                                : url + '?' + newParam));
            }
            return result;
        }
        return {
            'request': function (config) {
                if (config.url.indexOf(CONFIG.viewDir) !== 0 && config.url.indexOf('select') !== 0 && config.url.indexOf('directives') !== 0 && config.url.indexOf('template') !== 0 && config.url.indexOf('ui-grid') !== 0) {
                    config.url = CONFIG.API.baseUrl + config.url;
                    if (config.method.toLowerCase() === 'get') {
                        config.url = addUrlParam(config.url, '_', Date.now());
                    }
                }
                return config;
            }
        };
    });
})
.constant('regexEscape', function regEsc(str) {
    //Escape string to be able to use it in a regular expression
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
})
.config(function ($stateProvider, $urlRouterProvider) {
    $urlRouterProvider.otherwise('/');
    $urlRouterProvider.when('/administration', '/administration/news');
    $stateProvider
        .state('contents', {
            url: '/',
            displayName: 'Enterprise',
            views: {
                '@': {
                    templateUrl: 'views/about.html',
                    controller: 'AboutCtrl'
                }
            }
        })
        .state('external', {
            url: '/external',
            displayName: 'External',
            views: {
                '@': {
                    templateUrl: 'views/external.html',
                    controller: 'ExternalCtrl'
                }
            }
        })
        .state('administration', {
            url: '/administration',
            abstract: true

        })
        .state('administration.list', {
            url: ''

        })
        .state('administration.list.news', {
            url: '/news',
            displayName: 'News',
            views: {
                '@': {
                    templateUrl: 'views/UIGrid.html',
                    controller: 'BINewsCtrl'
                }
            }
        })
        .state('administration.list.communication', {
            url: '/communication',
            displayName: 'Communication',
            views: {
                '@': {
                    templateUrl: 'views/UIGrid.html',
                    controller: 'BICommunicationCtrl'
                }
            }
        })
        .state('administration.list.groups', {
            url: '/groups',
            displayName: 'Persona',
            views: {
                '@': {
                    templateUrl: 'views/UIGrid.html',
                    controller: 'GroupCtrl'
                }
            }
        })
        .state('administration.list.levels', {
            url: '/level',
            displayName: 'Levels',
            views: {
                '@': {
                    templateUrl: 'views/UIGrid.html',
                    controller: 'LevelCtrl'
                }
            }
        })
        .state('administration.list.users', {
            url: '/users',
            displayName: 'Users',
            views: {
                '@': {
                    templateUrl: 'views/UIGrid.html',
                    controller: 'UsersCtrl'
                }
            }
        })
        .state('administration.list.audit', {
            url: '/audit',
            displayName: 'Audit',
            views: {
                '@': {
                    templateUrl: 'views/auditFilters.html',
                    controller: 'AuditCtrl'
                }
            }
        })
        .state('administration.list.recommended', {
            url: '/recommended',
            displayName: 'Recommended Reports',
            views: {
                '@': {
                    templateUrl: 'views/recommendedSelect.html',
                    controller: 'RecommendCtrl'
                }
            }
        })
        .state('administration.list.manageExternal', {
            url: '/manageExternal',
            displayName: 'Manage External Contents',
            views: {
                '@': {
                    templateUrl: 'views/manageExternal.html',
                    controller: 'ManageExternalCtrl'
                }
            }
        })
        .state('administration.list.notification', {
            url: '/notification',
            displayName: 'Notification',
            views: {
                '@': {
                    templateUrl: 'views/UIGrid.html',
                    controller: 'NotificationCtrl'
                }
            }
        })
        .state('notauth', {
            url: '/notauth',
            displayName: 'Not Authorized',
            templateUrl: 'views/notAuth.html'
        });
});
