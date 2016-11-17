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
.config(["CONFIG", "$provide", function (CONFIG, $provide) {
    //Only load mock data, if config says so
    if (!CONFIG.API.useMocks) {
        return;
    }
    //Decorate backend with awesomesauce
    $provide.decorator('$httpBackend', angular.mock.e2e.$httpBackendDecorator);
}])
.config(["CONFIG", "$httpProvider", function (CONFIG, $httpProvider) {
    $httpProvider.interceptors.push(["$q", "$timeout", "CONFIG", "$log", "$rootScope", function ($q, $timeout, CONFIG, $log, $rootScope) {
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
    }]);
}])
.constant('regexEscape', function regEsc(str) {
    //Escape string to be able to use it in a regular expression
    return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&');
})
.config(["$stateProvider", "$urlRouterProvider", function ($stateProvider, $urlRouterProvider) {
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
}]);

'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 * Run Block of the application.
 */
angular.module('adminPageApp')
.run(["CONFIG", "$httpBackend", "$log", "$rootScope", "$http", "userDetailsService", "$state", function (CONFIG, $httpBackend, $log, $rootScope, $http, userDetailsService, $state/*, regexEscape*/) {
    $rootScope.$on('$routeChangeStart', function (event, next, current) {
        $rootScope.setLoading(true);
    });

    $rootScope.$on('$routeChangeSuccess', function () {
        //scroll top when navigating from one to another
        document.body.scrollTop = document.documentElement.scrollTop = 0;
        $rootScope.setLoading(false);
    });

    $rootScope.$on('$routeChangeError', function (event, next, current, error) {
        $rootScope.setLoading(false);
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState) {
        //scroll top when navigating from one to another
        document.body.scrollTop = document.documentElement.scrollTop = 0;

        $rootScope.setLoading(false);
        if (toState && toState.name && toState.name.indexOf('notauth') !== 0) {
            if ($rootScope.userObject !== undefined && $rootScope.userObject.userinfo && $rootScope.userObject.userinfo.role) {
                if ($rootScope.userObject.userinfo.role.toLowerCase() !== 'admin' && $rootScope.userObject.userinfo.role.toLowerCase() !== 'buadmin') {
                    event.preventDefault();
                    $state.go('notauth');
                }
                if ($rootScope.userObject.userinfo.role.toLowerCase() === 'buadmin' && (toState.name === 'administration.list.news' || toState.name === 'administration.list.levels')) {
                    event.preventDefault();
                    $state.go('administration.list.communication');
                }
            } else {
                userDetailsService.userPromise.then(function (userobj) {
                    $rootScope.userObject = userobj[0];
                    if ($rootScope.userObject.userinfo && $rootScope.userObject.userinfo.role) {
                        if ($rootScope.userObject.userinfo.role.toLowerCase() !== 'admin' && $rootScope.userObject.userinfo.role.toLowerCase() !== 'buadmin') {
                            event.preventDefault();
                            $state.go('notauth');
                        }
                        if ($rootScope.userObject.userinfo.role.toLowerCase() === 'buadmin' && (toState.name === 'administration.list.groups' || toState.name === 'administration.list.news' || toState.name === 'administration.list.levels')) {
                            event.preventDefault();
                            $state.go('administration.list.communication');
                        }
                    } else {
                        event.preventDefault();
                        $state.go('notauth');
                    }
                }, function () {
                    event.preventDefault();
                    $state.go('notauth');
                });
            }
        }

    });

    /**
     *setLoading function is used to show/hide loading on screen.  
     */
    $rootScope.setLoading = function (loading) {

        $rootScope.isLoading = loading;
    };


    //loading user alert template to template cache in bootstrap to avoid sso auth for this template.
    //$http.get('views/useralert.html', {cache:$templateCache});

    //Only load mock data, if config says so
    if (!CONFIG.API.useMocks) {
        return;
    }

    //Allow templates under views folder to get actual data
    $httpBackend.whenGET(/views\/*/).passThrough();

    //GET tag/
    $httpBackend.whenGET(/getUserDetails/).respond(function (/*method, url, data, headers*/) {
        //$log.log('Intercepted GET to tag', data);
        //return [200, '[{"uid":"975409","userFullName":"Vidyadhar Guttikonda","emcIdentityType":"V","title":"Mobile Developer","mail":"Vidyadhar.Guttikonda@emc.com","emcCostCenter":"IN1218315","emcGeography":null,"emcOrgCode":null,"emcOrgName":"IT","emcEntitlementsCountry":"IN","emcLoginName":"guttiv","emctelephoneextension":null,"telephonenumber":"91  7702466463"}]', {/*headers*/}];
        return [200, '[{"uid":"990865","userFullName":"Sarunkumar Moorthy","emcIdentityType":"V","title":"web developer","mail":"Sarunkumar.Moorthy@emc.com","emcCostCenter":"US1018315","emcGeography":null,"emcOrgCode":null,"emcOrgName":null,"emcEntitlementsCountry":"IN","emcLoginName":"moorts5","emctelephoneextension":null,"telephonenumber":null}]', {/*headers*/}];
    });

    $httpBackend.whenGET(/userinfo\/*/).respond(function (/*method, url, data*/) {
        // return [200, '{"group":[{"groupId":1,"groupName":"Global Service"}],"role":"Admin","badge":"Bronze"}'];
        return [200, '{"group":[{"groupId":2,"groupName":"Global Service"}],"role":"admin","badge":"Bronze"}'];
    });
    
    $httpBackend.whenGET(/userExistInBITool\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"communicationList":[],"allGroups":null,"status":"Success","message":"Your account has not been setup in the Insights Portal with an associated Persona. Please contact insights.portal.help@emc.com for further assistance.","isApplicationRunning":true}'];
    });

    $httpBackend.whenGET(/allReports\/*/).respond(function (/*method, url, data*/) {
//        return [200, '[{"sourceReportId":"Aa_.CIY.1N1GgHnJWNloPs8","reportName":"VPLEX EWMA Calcs","reportType":"Webi","owner":"Administrator","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa_.CIY.1N1GgHnJWNloPs8","functionalArea":"TCE","functionalAreaLvl1":"TCE Publications","functionalAreaLvl2":null,"linkTitle":"VPLEX EWMA Calcs","linkHoverInfo":"VPLEX EWMA Calcs","createdDate":"Aug 13, 2014 11:36:17 AM","updatedDate":"Aug 26, 2014 04:31:25 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"TCE/TCE Publications","systemDescription":"BAAAS BOBJ TST","viewCount":2,"id":130198,"refreshStatus":"N","tabbedViews":"Y","recommended":"N"},{"sourceReportId":"Aa_MvwrrWGpHjjlbBgGlD3w","reportName":"Rights Modifications - by Object","reportType":"CrystalReport","owner":"Administrator","reportDesc":"Rights modification and Custom access level modified events are listed by object type, including user, object name, path location, event start time, event type and status. Report ID","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa_MvwrrWGpHjjlbBgGlD3w","functionalArea":"Miscellaneous","functionalAreaLvl1":"Test Audit Reports","functionalAreaLvl2":"Rights","linkTitle":"Rights Modifications - by Object","linkHoverInfo":"Rights Modifications - by Object","createdDate":"Oct 31, 2012 14:56:25 PM","updatedDate":"Oct 31, 2012 14:56:34 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Miscellaneous/Test Audit Reports/Rights","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130204,"refreshStatus":"Y","tabbedViews":"Y","recommended":"N"},{"sourceReportId":"Aa6vN2i3KAdJp.juYe0TRf0","reportName":"onlinelabiV1","reportType":"Webi","owner":"SampaR","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa6vN2i3KAdJp.juYe0TRf0","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Certification","functionalAreaLvl2":"Operations","linkTitle":"onlinelabiV1","linkHoverInfo":"onlinelabiV1","createdDate":"Feb 04, 2013 22:32:15 PM","updatedDate":"Feb 05, 2013 01:16:38 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Education Services and Dev/Certification/Operations","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130188,"refreshStatus":"N","tabbedViews":"Y","recommended":"N"},{"sourceReportId":"Aa7IdaUA_ONLvZQLO5wfGw8","reportName":"Income Statement","reportType":"CrystalReport","owner":"Administrator","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa7IdaUA_ONLvZQLO5wfGw8","functionalArea":"Miscellaneous","functionalAreaLvl1":"Report Samples","functionalAreaLvl2":"Financial","linkTitle":"Income Statement","linkHoverInfo":"Income Statement","createdDate":"Oct 31, 2011 14:41:07 PM","updatedDate":"Oct 31, 2011 14:41:07 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Miscellaneous/Report Samples/Financial","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130205,"refreshStatus":"N","tabbedViews":"Y","recommended":"N"},{"sourceReportId":"Aa9cWof0tYFJt967esggoAc","reportName":"GSC Accreditation","reportType":"Webi","owner":"SampaR","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa9cWof0tYFJt967esggoAc","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Curriculum","functionalAreaLvl2":"Proven","linkTitle":"GSC Accreditation","linkHoverInfo":"GSC Accreditation","createdDate":"Aug 24, 2015 15:54:49 PM","updatedDate":"Aug 27, 2015 13:00:08 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Education Services and Dev/Curriculum/Proven","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130193,"refreshStatus":"N","tabbedViews":"Y","recommended":"Y"},{"sourceReportId":"Aa9RluHR5DFNpT0gx4lG0AI","reportName":"MSPChargesbyBU PS Drill Down_Total [2]","reportType":"Webi","owner":"Administrator","reportDesc":"test","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa9RluHR5DFNpT0gx4lG0AI","functionalArea":"Backup","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"MSPChargesbyBU PS Drill Down_Total [2]","linkHoverInfo":"MSPChargesbyBU PS Drill Down_Total [2]","createdDate":"Dec 11, 2014 05:44:12 AM","updatedDate":"Dec 11, 2014 05:48:06 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Backup","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130216,"refreshStatus":"N","tabbedViews":"N","recommended":"N"},{"sourceReportId":"AaA8WDAQCJNNm3bHbnEewmw","reportName":"Training Unit Balance - APJ","reportType":"Webi","owner":"bosew","reportDesc":"test","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaA8WDAQCJNNm3bHbnEewmw","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Administration","functionalAreaLvl2":"Scheduled Jobs","linkTitle":"Training Unit Balance - APJ","linkHoverInfo":"Training Unit Balance - APJ","createdDate":"Jan 09, 2015 13:18:25 PM","updatedDate":"May 09, 2016 10:42:28 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Education Services and Dev/Administration/Scheduled Jobs/Unsecured","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130217,"refreshStatus":"N","tabbedViews":"N","recommended":"N"},{"sourceReportId":"Aab.BpI8FhhIqXrU5AL0L.k","reportName":"Calculated Member Cross-tab Chart","reportType":"CrystalReport","owner":"Administrator","reportDesc":"test","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aab.BpI8FhhIqXrU5AL0L.k","functionalArea":"Miscellaneous","functionalAreaLvl1":"Report Samples","functionalAreaLvl2":"Feature Samples","linkTitle":"Calculated Member Cross-tab Chart","linkHoverInfo":"Calculated Member Cross-tab Chart","createdDate":"Oct 31, 2011 14:39:59 PM","updatedDate":"Oct 31, 2011 14:39:59 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Miscellaneous/Report Samples/Feature Samples","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130218,"refreshStatus":"N","tabbedViews":"Y","recommended":"N"},{"sourceReportId":"Aab5eW48M6RPgqjgEl8gu0Y","reportName":"Curriculum_ESC","reportType":"Webi","owner":"ruchl","reportDesc":"test sm","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aab5eW48M6RPgqjgEl8gu0Y","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Inventory","functionalAreaLvl2":"Ed Services Rpt","linkTitle":"Curriculum_ESC","linkHoverInfo":"Curriculum_ESC","createdDate":"Aug 09, 2012 17:11:30 PM","updatedDate":"Aug 09, 2012 17:11:30 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Education Services and Dev/Inventory/Ed Services Rpt","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130219,"refreshStatus":"N","tabbedViews":"Y","recommended":"N"},{"sourceReportId":"AaBAl1iYpdZGkeod0_sL5Wo","reportName":"FGAC_TEST_040714","reportType":"Webi","owner":"ruchl","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaBAl1iYpdZGkeod0_sL5Wo","functionalArea":"Education Services and Dev","functionalAreaLvl1":"Administration","functionalAreaLvl2":"Ed Services Rpt","linkTitle":"FGAC_TEST_040714","linkHoverInfo":"FGAC_TEST_040714","createdDate":"Apr 07, 2014 17:00:57 PM","updatedDate":"May 09, 2014 12:21:59 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Education Services and Dev/Administration/Ed Services Rpt","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130228,"refreshStatus":"N","tabbedViews":"N","recommended":null},{"sourceReportId":"AaCmCd..VvNEjOGLZx7ZKPs","reportName":"PAS Milestone Invoice Forecast Results","reportType":"Webi","owner":"Administrator","reportDesc":"Full Result test","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaCmCd..VvNEjOGLZx7ZKPs","functionalArea":"Backup","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"PAS Milestone Invoice Forecast Results","linkHoverInfo":"PAS Milestone Invoice Forecast Results","createdDate":"Mar 06, 2013 12:34:36 PM","updatedDate":"Apr 23, 2014 09:37:58 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Backup","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130222,"refreshStatus":"Y","tabbedViews":"Y","recommended":"Y"},{"sourceReportId":"AaDCB93DC29OgSF8GVsnyGw","reportName":"Summarized Documents","reportType":"Webi","owner":"Administrator","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaDCB93DC29OgSF8GVsnyGw","functionalArea":"GBS Command Center","functionalAreaLvl1":"Financial Services","functionalAreaLvl2":"CMC","linkTitle":"Summarized Documents","linkHoverInfo":"Summarized Documents","createdDate":"Oct 01, 2015 05:49:18 AM","updatedDate":"Dec 31, 2015 01:46:38 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"GBS Command Center/Financial Services/CMC","systemDescription":"BAAAS BOBJ TST","viewCount":22,"id":130207,"refreshStatus":"N","tabbedViews":"Y","recommended":"N"},{"sourceReportId":"AaEgTNTR43tAu1Sc12GcW1Q","reportName":"ITSM Dashboard_TEST.xlf","reportType":"XL.XcelsiusEnterprise","owner":"Administrator","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaEgTNTR43tAu1Sc12GcW1Q","functionalArea":"Backup","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"ITSM Dashboard_TEST.xlf","linkHoverInfo":"ITSM Dashboard_TEST.xlf","createdDate":"Jul 25, 2014 05:55:03 AM","updatedDate":"Sep 24, 2014 08:19:36 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Backup","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130266,"refreshStatus":"N","tabbedViews":"N","recommended":null},{"sourceReportId":"AaFP5hAmL1ZNg6GGZo1c4G0","reportName":"EWMA Impact Event Rate by Cause B","reportType":"Webi","owner":"Administrator","reportDesc":"Slide 5-10. Used for publication Pupose","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaFP5hAmL1ZNg6GGZo1c4G0","functionalArea":"TCE","functionalAreaLvl1":"TCE Publications","functionalAreaLvl2":null,"linkTitle":"EWMA Impact Event Rate by Cause B","linkHoverInfo":"EWMA Impact Event Rate by Cause B","createdDate":"Dec 08, 2014 05:56:03 AM","updatedDate":"Dec 08, 2014 05:56:05 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"TCE/TCE Publications","systemDescription":"BAAAS BOBJ TST","viewCount":2,"id":130280,"refreshStatus":"N","tabbedViews":"N","recommended":null},{"sourceReportId":"AaGqUsk0WyRKvPzKhabbkPQ","reportName":"Solve Task Approval","reportType":"Webi","owner":"bosew","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaGqUsk0WyRKvPzKhabbkPQ","functionalArea":"Global Services","functionalAreaLvl1":"SOLVE","functionalAreaLvl2":null,"linkTitle":"Solve Task Approval","linkHoverInfo":"Solve Task Approval","createdDate":"Jan 19, 2016 08:42:37 AM","updatedDate":"Jan 19, 2016 08:42:43 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Global Services/SOLVE","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":"AaGzX1WWes9Aks5wqvS3pUM","reportName":"Objects - Events and Details - by User and Event Type","reportType":"CrystalReport","owner":"Administrator","reportDesc":"Welcome","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaGzX1WWes9Aks5wqvS3pUM","functionalArea":"Miscellaneous","functionalAreaLvl1":"Test Audit Reports","functionalAreaLvl2":"Objects - Events","linkTitle":"Objects - Events and Details - by User and Event Type","linkHoverInfo":"Objects - Events and Details - by User and Event Type","createdDate":"Oct 31, 2012 14:56:23 PM","updatedDate":"Oct 31, 2012 14:56:32 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Miscellaneous/Test Audit Reports/Objects - Events","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130225,"refreshStatus":"N","tabbedViews":"N","recommended":"N"},{"sourceReportId":"AahlPTOs679PicyffaFp4BM","reportName":"EWMA Rate, Dur, Avail by Product","reportType":"Webi","owner":"Administrator","reportDesc":"Slide 18 test","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AahlPTOs679PicyffaFp4BM","functionalArea":"TCE","functionalAreaLvl1":"TCE Publications","functionalAreaLvl2":"RP Reports","linkTitle":"EWMA Rate, Dur, Avail by Product","linkHoverInfo":"EWMA Rate, Dur, Avail by Product","createdDate":"Sep 30, 2015 11:01:21 AM","updatedDate":"Sep 30, 2015 11:01:28 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"TCE/TCE Publications/RP Reports","systemDescription":"BAAAS BOBJ TST","viewCount":37,"id":130221,"refreshStatus":"Y","tabbedViews":"Y","recommended":"Y"},{"sourceReportId":"AaI4bMWN9RBBrU3YjxscCGI","reportName":"Users - Most Active - by Refresh Events","reportType":"CrystalReport","owner":"Administrator","reportDesc":"This report summarizes the top 10 most active users based on refresh events for the specified date range.  All users are listed thereafter with their refresh event count.","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaI4bMWN9RBBrU3YjxscCGI","functionalArea":"Miscellaneous","functionalAreaLvl1":"Test Audit Reports","functionalAreaLvl2":"Users","linkTitle":"Users - Most Active - by Refresh Events","linkHoverInfo":"Users - Most Active - by Refresh Events","createdDate":"Oct 31, 2012 14:56:25 PM","updatedDate":"Oct 31, 2012 14:56:33 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Miscellaneous/Test Audit Reports/Users","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":"AaisS.t.93NGhd4E2ld3Gv4","reportName":"EAS Time Sheet Report - JAPAN","reportType":"Webi","owner":"Administrator","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AaisS.t.93NGhd4E2ld3Gv4","functionalArea":"Global Services","functionalAreaLvl1":"EAS","functionalAreaLvl2":null,"linkTitle":"EAS Time Sheet Report - JAPAN","linkHoverInfo":"EAS Time Sheet Report - JAPAN","createdDate":"Aug 22, 2012 09:37:08 AM","updatedDate":"Aug 22, 2012 09:37:09 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Global Services/EAS","systemDescription":"BAAAS BOBJ TST","viewCount":10,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":"AajPCVE.bA1Nm_S_kOjKHTg","reportName":"Interactive Sort Detail","reportType":"CrystalReport","owner":"Administrator","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=AajPCVE.bA1Nm_S_kOjKHTg","functionalArea":"Miscellaneous","functionalAreaLvl1":"Report Samples","functionalAreaLvl2":"Feature Samples","linkTitle":"Interactive Sort Detail","linkHoverInfo":"Interactive Sort Detail","createdDate":"Oct 31, 2011 14:40:13 PM","updatedDate":"Oct 31, 2011 14:40:13 PM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"Miscellaneous/Report Samples/Feature Samples","systemDescription":"BAAAS BOBJ TST","viewCount":0,"id":130229,"refreshStatus":"N","tabbedViews":"N","recommended":null}]'];
        return [200, '[{"sourceReportId":"109433","reportName":"*Information","reportType":"Tableau","owner":"broenp","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/CSEMEA_VBOT/views/VBOT106_EASShiftLeadTime/Information","functionalArea":"CSEMEA_VBOT","functionalAreaLvl1":"EMEA Field","functionalAreaLvl2":"VBOT106_EAS Shift LeadTime","linkTitle":" ","linkHoverInfo":" ","createdDate":"Feb 26, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"19469","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":35,"id":478,"refreshStatus":"N","tabbedViews":"N","recommended":null,"createdDateInDate":1424926800000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":20991,"displayType":null,"isHeaderFlag":0},{"sourceReportId":"109434","reportName":"*Avg Shift LeadTime","reportType":"Tableau","owner":"broenp","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/CSEMEA_VBOT/views/VBOT106_EASShiftLeadTime/AvgShiftLeadTime","functionalArea":"CSEMEA_VBOT","functionalAreaLvl1":"EMEA Field","functionalAreaLvl2":"VBOT106_EAS Shift LeadTime","linkTitle":" ","linkHoverInfo":" ","createdDate":"Feb 26, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"19469","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":151,"id":486,"refreshStatus":"N","tabbedViews":"N","recommended":null,"createdDateInDate":1424926800000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"109435","reportName":"*Actual Shift LeadTime","reportType":"Tableau","owner":"broenp","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/CSEMEA_VBOT/views/VBOT106_EASShiftLeadTime/ActualShiftLeadTime","functionalArea":"CSEMEA_VBOT","functionalAreaLvl1":"EMEA Field","functionalAreaLvl2":"VBOT106_EAS Shift LeadTime","linkTitle":" ","linkHoverInfo":" ","createdDate":"Feb 26, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"19469","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":81,"id":491,"refreshStatus":"N","tabbedViews":"N","recommended":null,"createdDateInDate":1424926800000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":0},{"sourceReportId":"113714","reportName":"e2e CSAT Dashboard","reportType":"Tableau","owner":"martim29","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/E2ECSATCSAllDashboardMockup/e2eCSATDashboard","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"E2E CSAT CS All Dashboard  Mock up","linkTitle":" ","linkHoverInfo":" ","createdDate":"Mar 16, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"20418","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":12,"id":483,"refreshStatus":"N","tabbedViews":"N","recommended":null,"createdDateInDate":1426478400000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"113715","reportName":"Remote CSAT Dashboard","reportType":"Tableau","owner":"martim29","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/E2ECSATCSAllDashboardMockup/RemoteCSATDashboard","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"E2E CSAT CS All Dashboard  Mock up","linkTitle":" ","linkHoverInfo":" ","createdDate":"Mar 16, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"20418","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":3,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1426478400000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"113716","reportName":"Field CSAT Dashboard","reportType":"Tableau","owner":"martim29","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/E2ECSATCSAllDashboardMockup/FieldCSATDashboard","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"E2E CSAT CS All Dashboard  Mock up","linkTitle":" ","linkHoverInfo":" ","createdDate":"Mar 16, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"20418","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":6,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1426478400000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"121702","reportName":"TB107_Introduction","reportType":"Tableau","owner":"anbazh","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_Introduction","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","linkTitle":" ","linkHoverInfo":" ","createdDate":"Apr 08, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":46,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1428465600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"121703","reportName":"TB107_Remote SR Ownership Change by Reason Code","reportType":"Tableau","owner":"anbazh","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_RemoteSROwnershipChangebyReasonCode","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","linkTitle":" ","linkHoverInfo":" ","createdDate":"Apr 08, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":44,"id":489,"refreshStatus":"N","tabbedViews":"N","recommended":null,"createdDateInDate":1428465600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"121704","reportName":"TB107_Remote SR Ownership Change by Create Method","reportType":"Tableau","owner":"anbazh","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_RemoteSROwnershipChangebyCreateMethod","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","linkTitle":" ","linkHoverInfo":" ","createdDate":"Apr 08, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":17,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1428465600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":0},{"sourceReportId":"121705","reportName":"TB107_Remote SR Ownership Change by Product","reportType":"Tableau","owner":"anbazh","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_RemoteSROwnershipChangebyProduct","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","linkTitle":" ","linkHoverInfo":" ","createdDate":"Apr 08, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":19,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1428465600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"121706","reportName":"TB107_Remote SR Ownership Change by Resolution Code","reportType":"Tableau","owner":"anbazh","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_RemoteSROwnershipChangebyResolutionCode","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","linkTitle":" ","linkHoverInfo":" ","createdDate":"Apr 08, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":9,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1428465600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"121707","reportName":"TB107_Remote SR Ownership Change by Global Team","reportType":"Tableau","owner":"anbazh","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_RemoteSROwnershipChangebyGlobalTeam","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","linkTitle":" ","linkHoverInfo":" ","createdDate":"Apr 08, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":23,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1428465600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"121708","reportName":"TB107_SR Ownership Cheat Sheet","reportType":"Tableau","owner":"anbazh","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/TB107_RemoteSROwnershipChangebyReasonCode_0/TB107_SROwnershipCheatSheet","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB107_Remote SR Ownership Change by Reason Code","linkTitle":" ","linkHoverInfo":" ","createdDate":"Apr 08, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"21715","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":11,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1428465600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"12770","reportName":"Entitlement Check Status Cover","reportType":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementCheckStatusCover","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","createdDate":"Sep 19, 2013 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":110,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1379563200000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"12771","reportName":"Entitlement Checks by Date","reportType":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementChecksbyDate","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","createdDate":"Sep 19, 2013 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":512,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1379563200000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"12772","reportName":"Entitlement Checks by GEO","reportType":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementChecksbyGEO","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","createdDate":"Sep 19, 2013 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":254,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1379563200000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"12773","reportName":"Entitlement Checks by Create Type","reportType":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementChecksbyCreateType","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","createdDate":"Sep 19, 2013 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":115,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1379563200000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"12774","reportName":"Entitlement Checks by WFM","reportType":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/EntitlementChecksbyWFM","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","createdDate":"Sep 19, 2013 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":392,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1379563200000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"12775","reportName":"SRs Referred to Renewals","reportType":"Tableau","owner":"mended","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/IIG/views/EntitlementCheckStatus/SRsReferredtoRenewals","functionalArea":"IIG","functionalAreaLvl1":"ENTITLEMENT CHECKS","functionalAreaLvl2":"Entitlement Check Status","linkTitle":" ","linkHoverInfo":" ","createdDate":"Sep 19, 2013 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"2106","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":184,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1379563200000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1},{"sourceReportId":"132111","reportName":"Cover Page","reportType":"Tableau","owner":"lestec1","reportDesc":null,"reportLink":"https://baaastableau.corp.emc.com/t/GS_BI/views/CriticalCareReportPublishedv1/CoverPage","functionalArea":"GS_BI","functionalAreaLvl1":"CS Escalation Management","functionalAreaLvl2":"Critical Care Report Published v1","linkTitle":" ","linkHoverInfo":" ","createdDate":"May 18, 2015 00:00:00 AM","updatedDate":"Aug 25, 2016 00:00:00 AM","sourceSystem":"BAaaS Tableau-PRD","additionalInfo":"23786","systemDescription":"BAaaS Taleau Instance-PRD","viewCount":25,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"createdDateInDate":1431921600000,"updatedDateInDate":1472097600000,"createdBy":null,"updatedBy":null,"rowCount":null,"displayType":null,"isHeaderFlag":1}]']
    });

    $httpBackend.whenGET(/communicationSearch\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"communicationList":[{"communicationId":28,"groupId":3,"link":"http://ddd","title":"test title sm unit test","details":"test details sm","image":"https://bipdurdev01.corp.emc.com/banners/saims_Tulips.jpg","groupIdList":null},{"communicationId":33,"groupId":3,"link":"https://bipdurdev01.corp.emc.com","title":"TestManufacturing","details":"test edit","image":"https://bipdurdev01.corp.emc.com/banners/saims_154604.jpg","groupIdList":null},{"communicationId":62,"groupId":3,"link":"https://bipdurdev01.corp.emc.com","title":"Example","details":"Example Details","image":"https://bipdurdev01.corp.emc.com/banners/moorts5_image","groupIdList":null},{"communicationId":75,"groupId":3,"link":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","title":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","details":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","image":"https://bipdurdev01.corp.emc.com/banners/moorts5_image","groupIdList":null},{"communicationId":109,"groupId":3,"link":"https://bipdurdev01.corp.emc.com","title":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","details":"https://bipdurdev01.corp.emc.com","image":"https://bipdurdev01.corp.emc.com/banners/moorts5_imageFile.png","groupIdList":null}],"allGroups":[{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":11,"groupName":"Sales Rep New","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":20,"groupName":"SapnaTesting","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":21,"groupName":"SapnaTestGroup","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":23,"groupName":"Test Personna","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":24,"groupName":"Unit test Persona","numberOfLevels":null,"levels":null,"levelMaps":null}]}'];
        //return [200, '{{"communicationList":[{"communicationId":3,"groupId":1,"link":"https://inside.emc.com/community/active/tableau_users_forum","title":"Tableau User ForumS","details":"Click for more info more 123","image":"https://bipdurdev01.corp.emc.com/banners/banner3.png","groupIdList":null},{"communicationId":20,"groupId":1,"link":"https://inside.emc.com/community/active/tableau_users_forum","title":"Tableau User Forum","details":"Click for more info..","image":"https://insights.corp.emc.com/banners/banner3.png","groupIdList":null},{"communicationId":22,"groupId":1,"link":"http://bipdurdev01.corp.emc.com:8080/docs/BannerDemo.png","title":"Comm Title unit test","details":"Click Thru unit test","image":"https://bipdurdev01.corp.emc.com/banners/saims_154604.jpg","groupIdList":null},{"communicationId":24,"groupId":1,"link":"https://inside.emc.com/community/active/tableau_users_forum","title":"Tableau User Forum","details":"Click for more info","image":"https://insights.corp.emc.com/banners/banner3.png","groupIdList":null},{"communicationId":44,"groupId":1,"link":"http://test.com","title":"new comm1","details":"test details","image":"https://insights.corp.emc.com/banners/banner1.png","groupIdList":null},{"communicationId":47,"groupId":1,"link":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","title":"Unit test comm for BU","details":"Unit test comm for BU desc","image":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","groupIdList":null},{"communicationId":48,"groupId":1,"link":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","title":"test comms","details":"ff","image":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","groupIdList":null},{"communicationId":50,"groupId":1,"link":"","title":"tests","details":"dfdfsdfsd","image":"https://bipdurdev01.corp.emc.com/banners/saims_154604.jpg","groupIdList":null},{"communicationId":60,"groupId":1,"link":"https://bipdurdev01.corp.emc.com","title":"Example","details":"Example Details","image":"https://bipdurdev01.corp.emc.com/banners/moorts5_image","groupIdList":null},{"communicationId":73,"groupId":1,"link":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","title":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","details":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","image":"https://bipdurdev01.corp.emc.com/banners/moorts5_image","groupIdList":null},{"communicationId":88,"groupId":1,"link":"https://bipdurdev01.corp.emc.com","title":"https://bipdurdev01.corp.emc.com","details":"https://bipdurdev01.corp.emc.com","image":"https://bipdurdev01.corp.emc.com/banners/saims_154604.jpg","groupIdList":null},{"communicationId":102,"groupId":1,"link":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","title":"xfgdfghfh","details":"gtrtryru","image":"https://bipdurdev01.corp.emc.com/banners/saims_Penguins.jpg","groupIdList":null},{"communicationId":103,"groupId":1,"link":"null","title":"test edit","details":"edit details","image":"https://bipdurdev01.corp.emc.com/banners/saims_154604.jpg","groupIdList":null},{"communicationId":107,"groupId":1,"link":"https://bipdurdev01.corp.","title":"data","details":"https://bipdurdev01.corp.","image":"https://bipdurdev01.corp.emc.com/banners/moorts5_imageFile.png","groupIdList":null},{"communicationId":108,"groupId":1,"link":"https://bipdurdev01.corp.emc.com","title":"https://bipdurdev01.corp.emc.com","details":"https://bipdurdev01.corp.emc.com","image":"https://bipdurdev01.corp.emc.com/banners/saims_Untitled.png","groupIdList":null},{"communicationId":112,"groupId":1,"link":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","title":"asw","details":"dvssfgdfg","image":"https://bipdurdev01.corp.emc.com/banners/154604.jpg","groupIdList":null},{"communicationId":113,"groupId":1,"link":"","title":"dfgdfghfghghj","details":"dgfhfg","image":"https://bipdurdev01.corp.emc.com/banners/saims_154604.jpg.png","groupIdList":null},{"communicationId":114,"groupId":1,"link":"https://bipdurdev01.corp.emc.com/admin/#/administration/communication","title":"aqw","details":"ddsfsd","image":"https://bipdurdev01.corp.emc.com/banners/saims_Penguins.jpg","groupIdList":null},{"communicationId":115,"groupId":1,"link":"http://localhost:9000/#/notauth","title":"http://localhost:9000/#/notauth","details":"http://localhost:9000/#/notauth Des","image":"https://bipdurdev01.corp.emc.com/banners/saims_154604.jpg","groupIdList":null},{"communicationId":116,"groupId":1,"link":"http://localh","title":"http://localh","details":"http://localh dessssss","image":"https://bipdurdev01.corp.emc.com/banners/moorts5_Desert.jpg","groupIdList":null}],"allGroups":[{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":11,"groupName":"Sales Rep New","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":20,"groupName":"SapnaTesting","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":21,"groupName":"SapnaTestGroup","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":23,"groupName":"Test Personna","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":24,"groupName":"Unit test Persona","numberOfLevels":null,"levels":null,"levelMaps":null}]}}']    
    });

    $httpBackend.whenGET(/newsSearch\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"id":7,"createdDate":"Jan 14, 2016 14:27:14 PM","description":"Test","title":"Test","url":"https://inside.emc.com/welcome"},{"id":5,"createdDate":"Jan 14, 2016 13:14:04 PM","description":"Test","title":"Test","url":"https://inside.emc.com/welcome"},{"id":4,"createdDate":"Jan 13, 2016 20:12:55 PM","description":"Updated Test","title":"Updated Test","url":"https://inside.emc.com/welcomeUpdated"},{"id":2,"createdDate":"Nov 17, 2015 00:00:00 AM","description":"EMC is agile now","title":"EMC Goes Agile","url":"https://inside.emc.com/welcome"},{"id":1,"createdDate":"Nov 16, 2015 10:58:24 AM","description":"New version of tableau","title":"Tableau new version","url":"https://inside.emc.com/community/active/career_center_and_skills_management"}]'];
    });

    $httpBackend.whenGET(/groupSearch\/*/).respond(function (/*method, url, data*/) {
//        return [200, '[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":37,"deletedBy":null,"deletedDate":null,"groupId":47,"groupName":"test","operationDashboardPage":"http://localhost:9000/#/","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":40,"groupName":"Test Persona","operationDashboardPage":"http://ssss","pageLink":"http://goo","buGroupId":2,"helpLinkLabel":"Test Help Systrem","buGroupName":"TCE"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":39,"groupName":"Sales_myPresales_Managers","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":38,"groupName":"Sales_myPresales_GPLT","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":37,"groupName":"Admin_Mobile","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":36,"groupName":"GPO_BI_Executive_View","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":35,"groupName":"GSBI_CS","operationDashboardPage":"http://ssss","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":34,"groupName":"Sales_General","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":33,"groupName":"Sales_Operations","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":32,"groupName":"GPO_BI_Development","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":30,"groupName":"TCE_Test","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":27,"groupName":"TCE_ALL","operationDashboardPage":"https://insights.corp.emc.com/doc/TCE.html","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":26,"groupName":"GBS_Customer and Professional Services","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":25,"groupName":"GBS_Financial Services","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":24,"groupName":"GBS_Commercial Services","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":23,"groupName":"IT_Demand","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":22,"groupName":"IT_Customer","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":21,"groupName":"IT_Service","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":20,"groupName":"IT_Executive","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":19,"groupName":"GBS_Analytics","operationDashboardPage":"http://ssss","pageLink":"http://google.com","buGroupId":2,"helpLinkLabel":"GBS Help and Support","buGroupName":"TCE"}]'];
        return [200, '[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":11,"deletedBy":null,"deletedDate":null,"groupId":40,"groupName":"Test Persona","operationDashboardPage":"http://ssss","pageLink":"http://goo","buGroupId":2,"helpLinkLabel":"Test Help Systrem","buGroupName":"TCE"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":39,"groupName":"Sales_myPresales_Managers","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":34,"groupName":"Sales_General","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":33,"groupName":"Sales_Operations","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":26,"groupName":"GBS_Customer and Professional Services","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":25,"groupName":"GBS_Financial Services","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":24,"groupName":"GBS_Commercial Services","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":22,"groupName":"IT_Customer","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":21,"groupName":"IT_Service","operationDashboardPage":null,"pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":11,"groupName":"Global Business Service","operationDashboardPage":"","pageLink":null,"buGroupId":null,"helpLinkLabel":null,"buGroupName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"groupId":2,"groupName":"Global Service","operationDashboardPage":"https://bipdurdev01.corp.emc.com/BITool/report/csatreport","pageLink":"https://bipdurdev01.corp.emc.com/BITool/report/csatreport","buGroupId":null,"helpLinkLabel":null,"buGroupName":null}]']
    });

    $httpBackend.whenGET(/levelSearch\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"levelList":[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":118,"levelId":129,"levelDesc":"Planning Sub","levelNumber":2,"parentLevelId":128,"groupIds":null,"childLevelId":null,"parentLevelName":"Plan"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":128,"levelDesc":"Plan","levelNumber":1,"parentLevelId":null,"groupIds":null,"childLevelId":null,"parentLevelName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":127,"levelDesc":"Plan","levelNumber":1,"parentLevelId":null,"groupIds":null,"childLevelId":null,"parentLevelName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":126,"levelDesc":"Financial Services","levelNumber":1,"parentLevelId":null,"groupIds":null,"childLevelId":null,"parentLevelName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":125,"levelDesc":"test114","levelNumber":3,"parentLevelId":124,"groupIds":null,"childLevelId":null,"parentLevelName":"test24"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":124,"levelDesc":"test24","levelNumber":2,"parentLevelId":24,"groupIds":null,"childLevelId":null,"parentLevelName":"Insights Demo"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":123,"levelDesc":"test","levelNumber":2,"parentLevelId":78,"groupIds":null,"childLevelId":null,"parentLevelName":"Account Services"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":120,"levelDesc":"Admin_Level3a","levelNumber":3,"parentLevelId":114,"groupIds":null,"childLevelId":null,"parentLevelName":"Admin_Level2"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":115,"levelDesc":"Admin_Level3","levelNumber":3,"parentLevelId":114,"groupIds":null,"childLevelId":null,"parentLevelName":"Admin_Level2"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":114,"levelDesc":"Admin_Level2","levelNumber":2,"parentLevelId":24,"groupIds":null,"childLevelId":null,"parentLevelName":"Insights Demo"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":113,"levelDesc":"IT_Demand","levelNumber":1,"parentLevelId":null,"groupIds":null,"childLevelId":null,"parentLevelName":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":109,"levelDesc":"Returns Tracking Team","levelNumber":3,"parentLevelId":50,"groupIds":null,"childLevelId":null,"parentLevelName":"Inventory"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":108,"levelDesc":"Inventory Returns Optimization","levelNumber":3,"parentLevelId":50,"groupIds":null,"childLevelId":null,"parentLevelName":"Inventory"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":107,"levelDesc":"General Accounting","levelNumber":3,"parentLevelId":49,"groupIds":null,"childLevelId":null,"parentLevelName":"General Accounting"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":106,"levelDesc":"Corporate Tax","levelNumber":3,"parentLevelId":48,"groupIds":null,"childLevelId":null,"parentLevelName":"Finance"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":105,"levelDesc":"Worldwide Reporting","levelNumber":3,"parentLevelId":39,"groupIds":null,"childLevelId":null,"parentLevelName":"Credit & Collections"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":104,"levelDesc":"Sales & Use Tax (NA only)","levelNumber":3,"parentLevelId":39,"groupIds":null,"childLevelId":null,"parentLevelName":"Credit & Collections"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":103,"levelDesc":"Invoicing","levelNumber":3,"parentLevelId":39,"groupIds":null,"childLevelId":null,"parentLevelName":"Credit & Collections"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":102,"levelDesc":"Credit/Risk Management","levelNumber":3,"parentLevelId":39,"groupIds":null,"childLevelId":null,"parentLevelName":"Credit & Collections"},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"levelId":101,"levelDesc":"Collections Management","levelNumber":3,"parentLevelId":39,"groupIds":null,"childLevelId":null,"parentLevelName":"Credit & Collections"}],"allLevels":null,"allGroups":[{"groupId":12,"groupName":"Admin","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":0,"groupName":"Default","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":19,"groupName":"GBS_Analytics","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":24,"groupName":"GBS_Commercial Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":26,"groupName":"GBS_Customer and Professional Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":25,"groupName":"GBS_Financial Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":18,"groupName":"GBS_Management","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":11,"groupName":"Global Business Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":22,"groupName":"IT_Customer","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":23,"groupName":"IT_Demand","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":20,"groupName":"IT_Executive","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":21,"groupName":"IT_Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":9,"groupName":"Sales Ops Analyst","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":10,"groupName":"Sales Ops Specialist","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":27,"groupName":"TCE_ALL","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":17,"groupName":"TCE_Competitive Intelligent/Market Intelligent","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":13,"groupName":"TCE_EMC Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":15,"groupName":"TCE_Quality","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":16,"groupName":"TCE_Sales Go To Market","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":36,"groupName":"test","numberOfLevels":null,"levels":null,"levelMaps":null}]}'];
    });

    $httpBackend.whenGET(/userSearch\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"users":[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":30,"deletedBy":null,"deletedDate":null,"userName":"kippa-Disabled","userId":3289,"login":null,"groupId":34,"groupName":"Sales_General","fullName":"Ackeem Kipp","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"conaca-Disabled","userId":3288,"login":null,"groupId":35,"groupName":"GSBI_CS","fullName":"Alexandra Conachy","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"laddd-Disabled","userId":3287,"login":null,"groupId":35,"groupName":"GSBI_CS","fullName":"Daniel Ladd","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"warfid-Disabled","userId":3286,"login":null,"groupId":35,"groupName":"GSBI_CS","fullName":"Daniel Warfield","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"rabidg-Disabled","userId":3285,"login":null,"groupId":35,"groupName":"GSBI_CS","fullName":"Gary Rabidou Jr.","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"farizf-Disabled","userId":3262,"login":null,"groupId":34,"groupName":"Sales_General","fullName":"Farah Fariz","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"ocallf-Disabled","userId":3242,"login":null,"groupId":33,"groupName":"Sales_Operations","fullName":"Frank OCallaghan","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"mcgrem1-Disabled","userId":3240,"login":null,"groupId":33,"groupName":"Sales_Operations","fullName":"Meaghan Mcgree","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"bergqn-Disabled","userId":3239,"login":null,"groupId":33,"groupName":"Sales_Operations","fullName":"Nathaniel Bergquist","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"machas3-Disabled","userId":3238,"login":null,"groupId":33,"groupName":"Sales_Operations","fullName":"Steven Machacz","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"heffet-Disabled","userId":3237,"login":null,"groupId":33,"groupName":"Sales_Operations","fullName":"Timothy Heffernan","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"BRETOG-Disabled","userId":3229,"login":null,"groupId":32,"groupName":"GPO_BI_Development","fullName":"Greg Breton","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"narayr11-Disabled","userId":3038,"login":null,"groupId":12,"groupName":"Admin","fullName":"Renjith Narayanan","role":"Admin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"moorts5","userId":3034,"login":null,"groupId":35,"groupName":"GSBI_CS","fullName":"Sarunkumar Moorthy","role":"Admin","isMultiplePersona":true},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"saims","userId":223,"login":null,"groupId":19,"groupName":"GBS_Analytics","fullName":"Sk Mahammad Saim","role":"Admin","isMultiplePersona":true},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"murraj7-Disabled","userId":215,"login":null,"groupId":20,"groupName":"IT_Executive","fullName":"John Murray","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"mclelj-Disabled","userId":214,"login":null,"groupId":19,"groupName":"GBS_Analytics","fullName":"John McLellan","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"palmet5-Disabled","userId":161,"login":null,"groupId":27,"groupName":"TCE_ALL","fullName":"Todd Palmer","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"karths1-Disabled","userId":132,"login":null,"groupId":27,"groupName":"TCE_ALL","fullName":"Siddarth Karthekeyan","role":"BUAdmin","isMultiplePersona":false},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"userName":"NARAYS22","userId":112,"login":null,"groupId":37,"groupName":"Admin_Mobile","fullName":"Sridharan Narayanan","role":"Admin","isMultiplePersona":true}],"allRoles":["Admin","BUAdmin","User"],"allGroups":[{"groupId":12,"groupName":"Admin","numberOfLevels":null,"buGroupName":null},{"groupId":37,"groupName":"Admin_Mobile","numberOfLevels":null,"buGroupName":null},{"groupId":19,"groupName":"GBS_Analytics","numberOfLevels":null,"buGroupName":null},{"groupId":24,"groupName":"GBS_Commercial Services","numberOfLevels":null,"buGroupName":null},{"groupId":26,"groupName":"GBS_Customer and Professional Services","numberOfLevels":null,"buGroupName":null},{"groupId":25,"groupName":"GBS_Financial Services","numberOfLevels":null,"buGroupName":null},{"groupId":18,"groupName":"GBS_Management","numberOfLevels":null,"buGroupName":null},{"groupId":11,"groupName":"Global Business Service","numberOfLevels":null,"buGroupName":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"buGroupName":null},{"groupId":32,"groupName":"GPO_BI_Development","numberOfLevels":null,"buGroupName":null},{"groupId":36,"groupName":"GPO_BI_Executive_View","numberOfLevels":null,"buGroupName":null},{"groupId":35,"groupName":"GSBI_CS","numberOfLevels":null,"buGroupName":null},{"groupId":22,"groupName":"IT_Customer","numberOfLevels":null,"buGroupName":null},{"groupId":23,"groupName":"IT_Demand","numberOfLevels":null,"buGroupName":null},{"groupId":20,"groupName":"IT_Executive","numberOfLevels":null,"buGroupName":null},{"groupId":21,"groupName":"IT_Service","numberOfLevels":null,"buGroupName":null},{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"buGroupName":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"buGroupName":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"buGroupName":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"buGroupName":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"buGroupName":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"buGroupName":null},{"groupId":9,"groupName":"Sales Ops Analyst","numberOfLevels":null,"buGroupName":null},{"groupId":10,"groupName":"Sales Ops Specialist","numberOfLevels":null,"buGroupName":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"buGroupName":null},{"groupId":34,"groupName":"Sales_General","numberOfLevels":null,"buGroupName":null},{"groupId":38,"groupName":"Sales_myPresales_GPLT","numberOfLevels":null,"buGroupName":null},{"groupId":39,"groupName":"Sales_myPresales_Managers","numberOfLevels":null,"buGroupName":null},{"groupId":33,"groupName":"Sales_Operations","numberOfLevels":null,"buGroupName":null},{"groupId":27,"groupName":"TCE_ALL","numberOfLevels":null,"buGroupName":null},{"groupId":17,"groupName":"TCE_Competitive Intelligent/Market Intelligent","numberOfLevels":null,"buGroupName":null},{"groupId":13,"groupName":"TCE_EMC Exec","numberOfLevels":null,"buGroupName":null},{"groupId":15,"groupName":"TCE_Quality","numberOfLevels":null,"buGroupName":null},{"groupId":16,"groupName":"TCE_Sales Go To Market","numberOfLevels":null,"buGroupName":null},{"groupId":30,"groupName":"TCE_Test","numberOfLevels":null,"buGroupName":null}]}'];
    });
    
    $httpBackend.whenGET(/getBUAdminGroup\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"groupName":"TCE_EMC Exec","userCount":390,"groupId":13,"buGroupName":"TCE"},{"groupName":"TCE_Sales Go To Market","userCount":149,"groupId":16,"buGroupName":"TCE"},{"groupName":"GBS_Commercial Services","userCount":90,"groupId":24,"buGroupName":"GBS"},{"groupName":"IT_Executive","userCount":69,"groupId":20,"buGroupName":"IT"},{"groupName":"TCE_ALL","userCount":62,"groupId":27,"buGroupName":"TCE"},{"groupName":"TCE_Quality","userCount":60,"groupId":15,"buGroupName":"TCE"},{"groupName":"GBS_Financial Services","userCount":27,"groupId":25,"buGroupName":"GBS"},{"groupName":"GBS_Analytics","userCount":14,"groupId":19,"buGroupName":"GBS"},{"groupName":"Admin","userCount":11,"groupId":12,"buGroupName":"IT"},{"groupName":"GPO_BI_Development","userCount":11,"groupId":32,"buGroupName":"GPO"},{"groupName":"Sales_Operations","userCount":11,"groupId":33,"buGroupName":"Sales"},{"groupName":"TCE_Competitive Intelligent/Market Intelligent","userCount":10,"groupId":17,"buGroupName":"TCE"},{"groupName":"IT_Demand","userCount":10,"groupId":23,"buGroupName":"IT"},{"groupName":"Admin_Mobile","userCount":8,"groupId":37,"buGroupName":"IT"},{"groupName":"GSBI_CS","userCount":7,"groupId":35,"buGroupName":"GSBI"},{"groupName":"GBS_Customer and Professional Services","userCount":6,"groupId":26,"buGroupName":"GBS"},{"groupName":"Sales_General","userCount":4,"groupId":34,"buGroupName":"Sales"},{"groupName":"IT_Customer","userCount":4,"groupId":22,"buGroupName":"IT"},{"groupName":"Sales Exec","userCount":3,"groupId":7,"buGroupName":"Sales"},{"groupName":"Manufacturing","userCount":2,"groupId":1,"buGroupName":"TCE"},{"groupName":"GBS_Management","userCount":2,"groupId":18,"buGroupName":"GBS"},{"groupName":"Global Service","userCount":1,"groupId":2,"buGroupName":"GBS"},{"groupName":"Sales DVP","userCount":1,"groupId":5,"buGroupName":"Sales"},{"groupName":"Global Business Service","userCount":1,"groupId":11,"buGroupName":"GBS"},{"groupName":"GPO_BI_Executive_View","userCount":0,"groupId":36,"buGroupName":"GPO"},{"groupName":"IT_Service","userCount":0,"groupId":21,"buGroupName":"IT"},{"groupName":"Sales AM","userCount":0,"groupId":3,"buGroupName":"Sales"},{"groupName":"Sales DM","userCount":0,"groupId":4,"buGroupName":"Sales"},{"groupName":"Sales Non Core","userCount":0,"groupId":6,"buGroupName":"Sales"},{"groupName":"Sales Ops Analyst","userCount":0,"groupId":9,"buGroupName":"Sales"},{"groupName":"Sales Ops Specialist","userCount":0,"groupId":10,"buGroupName":"Sales"},{"groupName":"Sales Rep","userCount":0,"groupId":8,"buGroupName":"Sales"},{"groupName":"Sales_myPresales_GPLT","userCount":0,"groupId":38,"buGroupName":"Sales"},{"groupName":"Sales_myPresales_Managers","userCount":0,"groupId":39,"buGroupName":"Sales"},{"groupName":"TCE_Test","userCount":0,"groupId":30,"buGroupName":"TCE"},{"groupName":"test","userCount":0,"groupId":47,"buGroupName":"Sales"},{"groupName":"Test Persona","userCount":0,"groupId":40,"buGroupName":"TCE"}]'];
    });
    
    $httpBackend.whenGET(/getBIGroupForBUAdmin\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"groupName":"test","userCount":0,"groupId":47,"buGroupName":"Sales"},{"groupName":"Test Persona","userCount":0,"groupId":40,"buGroupName":"TCE"}]'];
    });
    
    $httpBackend.whenGET(/getBIAuditSearchReport\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"reportAuditId":230,"reportId":null,"userId":null,"reportType":"Webi","functionalArea":"TCE","accessDate":1463669760733,"sourceSystem":"BAAAS BOBJ TST","sourceReportId":"AahlPTOs679PicyffaFp4BM","refreshStatus":"N","type":"Persona","reportName":"EWMA Rate, Dur, Avail by Product","userName":"Sarunkumar Moorthy","owner":"Administrator","groupId":null,"groupName":"Global Service"},{"reportAuditId":234,"reportId":null,"userId":null,"reportType":"Webi","functionalArea":"TCE","accessDate":1463759074340,"sourceSystem":"BAAAS BOBJ TST","sourceReportId":"AahlPTOs679PicyffaFp4BM","refreshStatus":"N","type":"Persona","reportName":"EWMA Rate, Dur, Avail by Product","userName":"Sarunkumar Moorthy","owner":"Administrator","groupId":null,"groupName":"Global Service"},{"reportAuditId":235,"reportId":null,"userId":null,"reportType":"Webi","functionalArea":"TCE","accessDate":1463759109903,"sourceSystem":"BAAAS BOBJ TST","sourceReportId":"AahlPTOs679PicyffaFp4BM","refreshStatus":"N","type":"Persona","reportName":"EWMA Rate, Dur, Avail by Product","userName":"Sarunkumar Moorthy","owner":"Administrator","groupId":null,"groupName":"Global Service"},{"reportAuditId":238,"reportId":null,"userId":null,"reportType":"Webi","functionalArea":"TCE","accessDate":1463992171917,"sourceSystem":"BAAAS BOBJ TST","sourceReportId":"AahlPTOs679PicyffaFp4BM","refreshStatus":"N","type":"Persona","reportName":"EWMA Rate, Dur, Avail by Product","userName":"Sarunkumar Moorthy","owner":"Administrator","groupId":null,"groupName":"Global Service"},{"reportAuditId":233,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"SO_Analytics","accessDate":1463755714480,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"100238","refreshStatus":"N","type":"Persona","reportName":"myPlay Dashboard","userName":"Sridharan Narayanan","owner":"saricf","groupId":null,"groupName":"Global Service"},{"reportAuditId":239,"reportId":null,"userId":null,"reportType":"CrystalReport","functionalArea":"Miscellaneous","accessDate":1463992180260,"sourceSystem":"BAAAS BOBJ TST","sourceReportId":"AaGzX1WWes9Aks5wqvS3pUM","refreshStatus":"N","type":"Persona","reportName":"Objects - Events and Details - by User and Event Type","userName":"Sarunkumar Moorthy","owner":"Administrator","groupId":null,"groupName":"Global Service"},{"reportAuditId":236,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1463759116827,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sarunkumar Moorthy","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":237,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1463759397287,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sarunkumar Moorthy","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":244,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1464014075197,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sarunkumar Moorthy","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":231,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1463753101033,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Search","reportName":"SLO Definitions","userName":"Sridharan Narayanan","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":232,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1463755228437,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sridharan Narayanan","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":241,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1464012467810,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sridharan Narayanan","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":242,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1464012479030,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sridharan Narayanan","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":243,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1464014010463,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sridharan Narayanan","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":245,"reportId":null,"userId":null,"reportType":"Tableau","functionalArea":"GS_BI","accessDate":1464099452217,"sourceSystem":"BAaaS Tableau-SBX","sourceReportId":"131154","refreshStatus":"N","type":"Persona","reportName":"SLO Definitions","userName":"Sridharan Narayanan","owner":"ma1","groupId":null,"groupName":"Global Service"},{"reportAuditId":240,"reportId":null,"userId":null,"reportType":"Webi","functionalArea":"Education Services and Dev","accessDate":1463994978290,"sourceSystem":"BAAAS BOBJ TST","sourceReportId":"AaA8WDAQCJNNm3bHbnEewmw","refreshStatus":"N","type":"Persona","reportName":"Training Unit Balance - APJ","userName":"Sarunkumar Moorthy","owner":"accrajaa","groupId":null,"groupName":"Global Service"}]'];
    });
    
    $httpBackend.whenGET(/getFunctionalArea\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"TCE","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Miscellaneous","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Education Services and Dev","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Backup","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"GBS Command Center","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Global Services","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Powerlink Reporting","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"CMC Reporting","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"UnITy Reporting","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"BI4IT Reporting","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Global Business Operations","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"SIP","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"ECD Dashboard","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Web Intelligence Samples","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Commissions","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Default","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"SO_Analytics","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"GS_BI","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Marketing","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"DPAD_CI_Reporting","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null}]'];
    });
    
    $httpBackend.whenGET(/getReportType\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"sourceReportId":null,"reportName":null,"reportType":"CrystalReport","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":"Tableau","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":"XL.XcelsiusEnterprise","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":null,"additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null}]'];
    });
    
    $httpBackend.whenGET(/getSourceSystem\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":"BAAAS BOBJ TST","additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":"BAaaS Tableau-SBX","additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null},{"sourceReportId":null,"reportName":null,"reportType":null,"owner":null,"reportDesc":null,"reportLink":null,"functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"createdDate":null,"updatedDate":null,"sourceSystem":"PROPEL BOBJ QAS","additionalInfo":null,"systemDescription":null,"viewCount":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null}]'];
    });
    
    $httpBackend.whenGET(/getRecommendedReportPage\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"recommendedCount":4,"biReportDTOList":[{"id":130188,"name":"onlinelabiV1_test","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Education Services and Dev","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":45,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":1},{"id":130188,"name":"onlinelabiV1_test","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Education Services and Dev","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":46,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":3},{"id":130188,"name":"onlinelabiV1_test","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Education Services and Dev","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":51,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":2},{"id":130207,"name":"Summarized Documents","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"GBS Command Center","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":43,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":null},{"id":130217,"name":"Training Unit Balance - APJ","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Education Services and Dev","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":51,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":null},{"id":130221,"name":"EWMA Rate, Dur, Avail by Product","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"TCE","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":51,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":null},{"id":130224,"name":"SLA Metrics","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"GBS Command Center","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":51,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":null},{"id":130225,"name":"Objects - Events and Details - by User and Event Type","type":"CrystalReport","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Miscellaneous","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":50,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":null},{"id":130226,"name":"PAS Report","type":"Webi","owner":null,"reportDesc":null,"reportLink":null,"functionalArea":"Global Services","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"sourceSystem":null,"sourceReportId":null,"additionalInfo":null,"systemDescription":null,"createDate":null,"updateDate":null,"favorite":null,"levelId":50,"reportAccessStatus":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"groupId":2,"recommendedSeq":null}],"biGroupDTOList":[{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":11,"groupName":"Sales Rep New","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":20,"groupName":"SapnaTesting","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":21,"groupName":"SapnaTestGroup","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":23,"groupName":"Test Personna","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":24,"groupName":"Unit test Persona","numberOfLevels":null,"levels":null,"levelMaps":null}],"deletedBIReportDTOList":null}'];
    });
    
    $httpBackend.whenGET(/getReport\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"sourceReportId":"Aa_.CIY.1N1GgHnJWNloPs8","reportName":"VPLEX EWMA Calcs","reportType":"Webi","owner":"Administrator","reportDesc":"","reportLink":"http://entbobjtst.isus.emc.com/BOE/OpenDocument/opendoc/openDocument.jsp?sIDType=CUID&iDocID=Aa_.CIY.1N1GgHnJWNloPs8","functionalArea":"TCE","functionalAreaLvl1":"TCE Publications","functionalAreaLvl2":null,"linkTitle":"VPLEX EWMA Calcs","linkHoverInfo":"VPLEX EWMA Calcs","createdDate":"Aug 13, 2014 11:36:17 AM","updatedDate":"Aug 26, 2014 04:31:25 AM","sourceSystem":"BAAAS BOBJ TST","additionalInfo":"TCE/TCE Publications","systemDescription":"BAAAS BOBJ TST","viewCount":2,"id":130198,"refreshStatus":"N","tabbedViews":"Y","recommended":null}'];
    });
    
    $httpBackend.whenGET(/externalrepo\/searchreports\/*/).respond(function (/*method, url, data*/) {
//        return [200, '[{"sourceReportId":"EXTERNAL0","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"What is Lorem Ipsum","reportType":"CSV","owner":"Renjith Narayanan","reportDesc":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","reportLink":"//bipdurdev01/ThirdPartyCollaterals/AuditReport.csv","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":"","additionalInfo":null,"createdDate":"May 25, 2016 08:03:12 AM","updatedDate":"May 27, 2016 07:33:31 AM","createdBy":1047,"updatedBy":1047,"groupId":1,"groupName":"Manufacturing","id":130253,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL1","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test2_sm","reportType":"CSV","owner":"Renjith Narayanan","reportDesc":"tesrt_sm  vdffdd","reportLink":"//BIPdurdev01/colleacterla/test.csv","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"terst","linkHoverInfo":"sdfsdf","additionalInfo":null,"createdDate":"May 25, 2016 08:10:52 AM","updatedDate":"Jun 03, 2016 07:44:35 AM","createdBy":1047,"updatedBy":912,"groupId":1,"groupName":"Manufacturing","id":130256,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL10","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test","reportType":"PDF","owner":"Sk Mahammad Saim","reportDesc":"test description sda","reportLink":"//bipdurdev01/ThirdPartyCollaterals/Test.pdf","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"test sm","linkHoverInfo":"dfgf","additionalInfo":null,"createdDate":"Jun 01, 2016 05:16:20 AM","updatedDate":"Jun 03, 2016 06:44:30 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":130263,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL11","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"sdfsdsdffsd","reportType":"PDF","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01/ThirdPartyCollaterals/Test.pdf","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 01, 2016 05:16:56 AM","updatedDate":"Jun 01, 2016 05:16:56 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":130267,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL12","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"fsdsgdfgsdg","reportType":"PDF","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01/ThirdPartyCollaterals/Test.pdf","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 01, 2016 05:20:07 AM","updatedDate":"Jun 01, 2016 05:20:07 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":130269,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL13","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"sdfgfg","reportType":"xlsx","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Excel Data.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 01, 2016 06:48:51 AM","updatedDate":"Jun 01, 2016 06:48:51 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":130268,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL14","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Testing","reportType":"PDF","owner":"Sarunkumar Moorthy","reportDesc":"Test description","reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Test.pdf","functionalArea":"test func","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"test title","linkHoverInfo":"hover","additionalInfo":"#DFDFDF","createdDate":"Jun 01, 2016 08:17:11 AM","updatedDate":"Jun 01, 2016 08:17:11 AM","createdBy":1063,"updatedBy":1063,"groupId":2,"groupName":"Global Service","id":130265,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL15","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Changed Name","reportType":"xlsx","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Excel Data.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 01, 2016 08:41:27 AM","updatedDate":"Jun 01, 2016 10:29:56 AM","createdBy":912,"updatedBy":9,"groupId":2,"groupName":"Global Service","id":130270,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL16","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"seach tab test","reportType":"PDF","owner":"Sarunkumar Moorthy","reportDesc":"seach tab test description","reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Test.pdf","functionalArea":"search tab test","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"Title for test","linkHoverInfo":"hover for test","additionalInfo":"#DEDEDE","createdDate":"Jun 01, 2016 10:38:35 AM","updatedDate":"Jun 01, 2016 10:38:35 AM","createdBy":1063,"updatedBy":1063,"groupId":2,"groupName":"Global Service","id":130277,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL17","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"search test 2","reportType":"PDF","owner":"Sarunkumar Moorthy","reportDesc":"descr","reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Test.pdf","functionalArea":"functional  area","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"title","linkHoverInfo":"hover","additionalInfo":"#gggggg","createdDate":"Jun 01, 2016 10:39:29 AM","updatedDate":"Jun 01, 2016 10:39:29 AM","createdBy":1063,"updatedBy":1063,"groupId":2,"groupName":"Global Service","id":130276,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL18","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test","reportType":"xlsx","owner":"Sk Mahammad Saim","reportDesc":"test description","reportLink":"//bipdurdev01.emc.com/ThirdPartyCollaterals/Excel Data.xlsx","functionalArea":"test FA","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"test link","linkHoverInfo":"test","additionalInfo":"test","createdDate":"Jun 02, 2016 06:54:51 AM","updatedDate":"Jun 02, 2016 06:54:51 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":130278,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL19","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Test","reportType":"xlsx","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Excel Data.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 02, 2016 07:30:14 AM","updatedDate":"Jun 02, 2016 07:30:14 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL2","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"report3","reportType":"Unknown","owner":"Renjith Narayanan","reportDesc":"retr","reportLink":"//ter/re","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":"ert yyu","additionalInfo":null,"createdDate":"May 25, 2016 08:30:06 AM","updatedDate":"May 25, 2016 08:31:00 AM","createdBy":1047,"updatedBy":1047,"groupId":1,"groupName":"Manufacturing","id":130257,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL20","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test","reportType":"xlsx","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Excel Data.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 02, 2016 08:23:40 AM","updatedDate":"Jun 02, 2016 08:23:40 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL21","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Testing 1","reportType":"CSV","owner":"Sridharan Narayanan","reportDesc":"Report Desc","reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/AuditReport.csv","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"Testing","linkHoverInfo":"Testing","additionalInfo":"#ff00ee","createdDate":"Jun 02, 2016 10:24:59 AM","updatedDate":"Jun 02, 2016 10:24:59 AM","createdBy":9,"updatedBy":9,"groupId":2,"groupName":"Global Service","id":130272,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL22","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test","reportType":"xlsx","owner":"Sk Mahammad Saim","reportDesc":"test","reportLink":"//bipdurdev01.corp.emc.com/ThirdPartyCollaterals/Excel Data.xlsx","functionalArea":"ees","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"sss","linkHoverInfo":"sss","additionalInfo":"sss","createdDate":"Jun 03, 2016 06:36:58 AM","updatedDate":"Jun 03, 2016 06:36:58 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL23","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test","reportType":"HTTP","owner":"Sk Mahammad Saim","reportDesc":"tt","reportLink":"http://goo.com","functionalArea":"fgg","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"fgg","linkHoverInfo":"fgg","additionalInfo":"fg","createdDate":"Jun 03, 2016 07:45:12 AM","updatedDate":"Jun 03, 2016 07:45:12 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL24","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test sns","reportType":"PDF","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01/ThirdPartyCollaterals/Test.pdf","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 03, 2016 07:58:09 AM","updatedDate":"Jun 03, 2016 07:58:09 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL25","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Test sns","reportType":"PDF","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"//bipdurdev01/ThirdPartyCollaterals/Test.pdf","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":null,"createdDate":"Jun 03, 2016 07:59:23 AM","updatedDate":"Jun 03, 2016 07:59:23 AM","createdBy":912,"updatedBy":912,"groupId":2,"groupName":"Global Service","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null},{"sourceReportId":"EXTERNAL3","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Sample External Content","reportType":"CSV","owner":"Sarunkumar Moorthy","reportDesc":"Desc 2","reportLink":"//bipdurdev01/ThirdPartyCollaterals/AuditReport.csv","functionalArea":"Function Area not defined","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"Link Title","linkHoverInfo":"Link Hover Info","additionalInfo":"#F5A9D0","createdDate":"May 25, 2016 08:44:28 AM","updatedDate":"May 31, 2016 13:23:44 PM","createdBy":1063,"updatedBy":9,"groupId":2,"groupName":"Global Service","id":130258,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null}]'];
        return [200, '[{"sourceReportId":"EXTERNAL145","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"First","reportType":"HTTP","owner":"Sarunkumar Moorthy","reportDesc":"First","reportLink":"https://public.tableau.com/profile/curtis.harris#!/vizhome/Howhasthepopularityofyournamechanged/Howhasthepopularityofyournamechanged","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000FF","createdDate":"Sep 15, 2016 09:17:43 AM","updatedDate":"Sep 28, 2016 05:57:42 AM","createdBy":3034,"updatedBy":3034,"groupId":19,"groupName":"GBS_Analytics","id":492,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":140,"displayType":"N","isHeaderFlag":null},{"sourceReportId":"EXTERNAL144","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test ext","reportType":"HTTP","owner":"Sk Mahammad Saim","reportDesc":"test desctt","reportLink":"http://google.com","functionalArea":"test FA","functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"test Link","linkHoverInfo":"test info","additionalInfo":"#0000FF","createdDate":"Sep 14, 2016 06:29:13 AM","updatedDate":"Sep 28, 2016 03:06:14 AM","createdBy":223,"updatedBy":223,"groupId":19,"groupName":"GBS_Analytics","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL143","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Google Link","reportType":"HTTP","owner":"Sridharan Narayanan","reportDesc":"Google External","reportLink":"https://salesquestqa.corp.emc.com/","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"Test","linkHoverInfo":"Test","additionalInfo":"#0000FF","createdDate":"Sep 12, 2016 10:09:23 AM","updatedDate":"Sep 26, 2016 12:55:58 PM","createdBy":112,"updatedBy":112,"groupId":37,"groupName":"Admin_Mobile","id":490,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL142","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"fggdf","reportType":"HTTP","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"https://bipduruat01.corp.emc.com/admin/#/administration/manageExternal","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000FF","createdDate":"Aug 31, 2016 05:14:44 AM","updatedDate":"Sep 26, 2016 10:31:31 AM","createdBy":223,"updatedBy":223,"groupId":19,"groupName":"GBS_Analytics","id":494,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"N","isHeaderFlag":null},{"sourceReportId":"EXTERNAL141","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"edss","reportType":"HTTP","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"https://bipduruat01.corp.emc.com/admin/#/administration/manageExternal","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000FF","createdDate":"Aug 31, 2016 05:13:46 AM","updatedDate":"Sep 26, 2016 10:31:50 AM","createdBy":223,"updatedBy":223,"groupId":19,"groupName":"GBS_Analytics","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null,"rowCount":null,"displayType":"N","isHeaderFlag":null},{"sourceReportId":"EXTERNAL140","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test ext1ffff","reportType":"HTTP","owner":"Sk Mahammad Saim","reportDesc":null,"reportLink":"https://bipduruat01.corp.emc.com/admin/#/administration/manageExternal","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000FF","createdDate":"Aug 31, 2016 05:13:06 AM","updatedDate":"Sep 26, 2016 10:29:35 AM","createdBy":223,"updatedBy":223,"groupId":19,"groupName":"GBS_Analytics","id":485,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"N","isHeaderFlag":null},{"sourceReportId":"EXTERNAL139","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"test ext test","reportType":"HTTP","owner":"Sk Mahammad Saim","reportDesc":"dcsdsd","reportLink":"http://gooo","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":"sdds","linkHoverInfo":null,"additionalInfo":"#0000FF","createdDate":"Aug 31, 2016 05:11:46 AM","updatedDate":"Aug 31, 2016 05:15:22 AM","createdBy":223,"updatedBy":223,"groupId":19,"groupName":"GBS_Analytics","id":484,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL138","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Depth of Delivery Report - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provide insight into the number of resources by Workgroup and Primary Discipline.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Depth%20of%20Delivery%20-%20%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:40:38 PM","updatedDate":"Aug 25, 2016 13:40:38 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":477,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL137","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Project Excellence - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This dashboard gives a detailed overview of PM assignments, project ETC maintenance, forecast accuracy, and project status changes pertaining to VCP payout.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20PM%20Excellence%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:40:22 PM","updatedDate":"Aug 25, 2016 13:40:22 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":476,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL136","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Requested vs Staffed Comparison Report - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides a view of what Project Managers request verses what role was staffed against the request.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Requested%20to%20Staffed%20Comparison%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:30:49 PM","updatedDate":"Aug 25, 2016 13:30:49 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":475,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL135","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Timecard Compliance and Utilization - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides insight into both Employee and Subcontractors measurement of both Hour and Submittal Compliance of individuals and the utilization categories in which time has been logged against.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Timecard%20Compliance%20and%20Utilization%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:30:31 PM","updatedDate":"Aug 25, 2016 13:30:31 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":474,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL134","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"RM Demand Summary Report - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides insight into the previous 60 days of created roles within MRS, the volume of staffed roles, and current Staffed vs Open trending.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20RM%20-%20Demand%20Summary%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:30:04 PM","updatedDate":"Aug 25, 2016 13:30:04 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":473,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL133","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Bench and Assignment Report - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This Report provides a 60 day forward looking view into assignments of our delivery team members.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Bench%20and%20Assignment%20Report%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:29:46 PM","updatedDate":"Aug 25, 2016 13:29:46 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":472,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL132","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Services Booked Margin - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides with focused views of the business in an effort to provide insight into the booked margin for services.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Services%20Booked%20Margin%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:29:27 PM","updatedDate":"Aug 25, 2016 13:29:27 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":471,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL131","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Delivery Acceleration Report - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides Program Delivery Managers and Delivery Owners with various focused views of the business in an effort to drive delivery acceleration.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Delivery%20Acceleration%20Report%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:29:11 PM","updatedDate":"Aug 25, 2016 13:29:11 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":470,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL130","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"ASQ Compliance - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides field teams with the insight into the ASQ compliance measurement used within PS VCP goals.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20ASQ%20Compliance%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:28:47 PM","updatedDate":"Aug 25, 2016 13:28:47 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":469,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL129","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"PO Report (3rd Party Cost) - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":null,"reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20PO%20Report%20(3rd%20Party%20Cost%20Report)%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:28:31 PM","updatedDate":"Aug 25, 2016 13:28:31 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":468,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL128","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Project Health and Status Report - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides the health and status of a given project based on the conveyed information in CPM by the Program and Project managers.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Project%20Status%20and%20Health%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:28:17 PM","updatedDate":"Aug 25, 2016 13:28:17 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":467,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL127","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Debookings Report - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides insight in to the age of a project that has been set to TECO (Technically Complete) and how long until the remaining backlog on that WBSE will be debooked.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Debooking%20and%20TECO%20Report%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:28:00 PM","updatedDate":"Aug 25, 2016 13:28:00 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":466,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null},{"sourceReportId":"EXTERNAL126","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"Delivered Over Booked - APJ","reportType":"HTTP","owner":"Daniel Ladd","reportDesc":"This report provides insight into the delivered versus booked cost amounts for Closed and In Flight projects.","reportLink":"https://gsreporting.lss.emc.com/boeftp/ps_finance/IIG_APJ/IIG%20-%20Delivered%20Over%20Booked%20-%20APJ.xlsx","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":null,"additionalInfo":"#0000ff","createdDate":"Aug 25, 2016 13:27:44 PM","updatedDate":"Aug 25, 2016 13:27:44 PM","createdBy":3287,"updatedBy":3287,"groupId":35,"groupName":"GSBI_CS","id":465,"refreshStatus":"N","tabbedViews":"N","recommended":null,"viewCount":null,"rowCount":null,"displayType":"Y","isHeaderFlag":null}]']
    });
    
    $httpBackend.whenGET(/externalrepo\/searchreport\/*/).respond(function (/*method, url, data*/) {
//        return [200, '{"sourceReportId":"EXTERNAL1","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL","reportName":"ExcelData","reportType":"Excel","owner":"Sarunkumar","reportDesc":"Sales Details and the more details avaible with report","reportLink":"/bipdurdev01/ThirdPartyCollaterals/Excel Data.xlsx","functionalArea":"No functional Area","functionalAreaLvl1":"Level1","functionalAreaLvl2":"Level2","linkTitle":"Link title shows on hover over","linkHoverInfo":"Same title","additionalInfo":"#FFFDFD","createdDate":"05-19-2016  00:05","updatedDate":"05-19-2016  00:05","createdBy":"narays22","updatedBy":"narays22","groupId":1,"groupName":"Manufacturing","id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null}'];
        return [200, '{"sourceReportId":"EXTERNAL0","sourceSystem":"EXTERNAL","systemDescription":"EXTERNAL_SYSTEM","reportName":"What is Lorem Ipsum","reportType":"CSV","owner":"Renjith Narayanan","reportDesc":"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.","reportLink":"//bipdurdev01/ThirdPartyCollaterals/AuditReport.csv","functionalArea":null,"functionalAreaLvl1":null,"functionalAreaLvl2":null,"linkTitle":null,"linkHoverInfo":"","additionalInfo":null,"createdDate":"May 25, 2016 08:03:12 AM","updatedDate":"May 27, 2016 07:33:31 AM","createdBy":null,"updatedBy":null,"groupId":1,"groupName":null,"id":null,"refreshStatus":null,"tabbedViews":null,"recommended":null,"viewCount":null}'];
    });
    
    $httpBackend.whenGET(/getLevelAndGroup\/*/).respond(function (/*method, url, data*/) {
//        return [200, '{"reportId":130198,"levelsOfReport":null,"levelAndGroupIds":[{"groupId":1,"levelId":13,"recommendedSeq":3},{"groupId":2,"levelId":43,"recommendedSeq":null},{"groupId":3,"levelId":13,"recommendedSeq":3},{"groupId":7,"levelId":3,"recommendedSeq":null},{"groupId":7,"levelId":13,"recommendedSeq":3}],"groups":null,"allLevels":[{"levelNumber":4,"parentLevelId":1,"levelId":1,"levelDesc":"Plan0000000211313"},{"levelNumber":3,"parentLevelId":2,"levelId":2,"levelDesc":"Predictive_Analytics"},{"levelNumber":3,"parentLevelId":3,"levelId":3,"levelDesc":"Quality"},{"levelNumber":3,"parentLevelId":4,"levelId":4,"levelDesc":"Deliver Unit Test"},{"levelNumber":3,"parentLevelId":5,"levelId":5,"levelDesc":"Source"},{"levelNumber":3,"parentLevelId":6,"levelId":6,"levelDesc":"Make"},{"levelNumber":3,"parentLevelId":8,"levelId":8,"levelDesc":"Operational Excellence"},{"levelNumber":3,"parentLevelId":9,"levelId":9,"levelDesc":"Finance"},{"levelNumber":3,"parentLevelId":10,"levelId":10,"levelDesc":"Sustain"},{"levelNumber":2,"parentLevelId":12,"levelId":12,"levelDesc":"GPO_BI"},{"levelNumber":1,"parentLevelId":13,"levelId":13,"levelDesc":"Manufacturing"},{"levelNumber":1,"parentLevelId":14,"levelId":14,"levelDesc":"Sales"},{"levelNumber":2,"parentLevelId":15,"levelId":15,"levelDesc":"Bookings"},{"levelNumber":2,"parentLevelId":16,"levelId":16,"levelDesc":"Billings Reports"},{"levelNumber":3,"parentLevelId":24,"levelId":24,"levelDesc":"Test1"},{"levelNumber":2,"parentLevelId":25,"levelId":25,"levelDesc":"test12"},{"levelNumber":2,"parentLevelId":26,"levelId":26,"levelDesc":"TestLevel"},{"levelNumber":null,"parentLevelId":27,"levelId":27,"levelDesc":"test level"},{"levelNumber":3,"parentLevelId":29,"levelId":29,"levelDesc":"test"},{"levelNumber":3,"parentLevelId":30,"levelId":30,"levelDesc":"testsm"},{"levelNumber":56,"parentLevelId":34,"levelId":34,"levelDesc":"testsappy"},{"levelNumber":2,"parentLevelId":35,"levelId":35,"levelDesc":"sub sales"},{"levelNumber":1,"parentLevelId":36,"levelId":36,"levelDesc":"ParentLevel"},{"levelNumber":2,"parentLevelId":37,"levelId":37,"levelDesc":"ChildLevel"},{"levelNumber":2,"parentLevelId":38,"levelId":38,"levelDesc":"ChildLevel2"},{"levelNumber":3,"parentLevelId":39,"levelId":39,"levelDesc":"SubChild"},{"levelNumber":1,"parentLevelId":40,"levelId":40,"levelDesc":"SapnaParentLevel"},{"levelNumber":100,"parentLevelId":41,"levelId":41,"levelDesc":"SapnaChildLevel"},{"levelNumber":100,"parentLevelId":42,"levelId":42,"levelDesc":"Level100"},{"levelNumber":1,"parentLevelId":43,"levelId":43,"levelDesc":"Global Services 1"},{"levelNumber":1,"parentLevelId":44,"levelId":44,"levelDesc":"Global Services 2"},{"levelNumber":2,"parentLevelId":45,"levelId":45,"levelDesc":"GS Sub Level 1a"},{"levelNumber":2,"parentLevelId":46,"levelId":46,"levelDesc":"GS Sub Level 1b"},{"levelNumber":2,"parentLevelId":47,"levelId":47,"levelDesc":"Global Services 2a"},{"levelNumber":2,"parentLevelId":48,"levelId":48,"levelDesc":"Test Level"},{"levelNumber":2,"parentLevelId":49,"levelId":49,"levelDesc":"unit test level"},{"levelNumber":3,"parentLevelId":50,"levelId":50,"levelDesc":"GS Sub Level 1aa"},{"levelNumber":3,"parentLevelId":51,"levelId":51,"levelDesc":"GS Sub Level 1bb"},{"levelNumber":2,"parentLevelId":52,"levelId":52,"levelDesc":"dfsdfs"}],"allGroups":[{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":11,"groupName":"Sales Rep New","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":20,"groupName":"SapnaTesting","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":21,"groupName":"SapnaTestGroup","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":23,"groupName":"Test Personna","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":24,"groupName":"Unit test Persona","numberOfLevels":null,"levels":null,"levelMaps":null}]}'];
        return [200, '{"reportId":478,"levelsOfReport":null,"levelAndGroupIds":[{"groupId":2,"levelId":78,"recommendedSeq":1,"biLevelJSONList":[{"levelId":78,"levelDesc":"Account Services"},{"levelId":46,"levelDesc":"Accounts Payable / Travel & Expense"},{"levelId":98,"levelDesc":"Accounts Payable / Travel & Expense"},{"levelId":175,"levelDesc":"Americas_BPR"},{"levelId":174,"levelDesc":"Business Position Reports"},{"levelId":52,"levelDesc":"CS Support Services"},{"levelId":45,"levelDesc":"Customer and Professional Services"},{"levelId":33,"levelDesc":"Financial Services"},{"levelId":173,"levelDesc":"Professional Services"}]},{"groupId":3,"levelId":174,"recommendedSeq":null,"biLevelJSONList":[{"levelId":174,"levelDesc":"Business Position Reports"},{"levelId":24,"levelDesc":"Insights Demo"},{"levelId":173,"levelDesc":"Professional Services"},{"levelId":189,"levelDesc":"Visit"}]},{"groupId":37,"levelId":78,"recommendedSeq":null,"biLevelJSONList":[{"levelId":126,"levelDesc":"Account"},{"levelId":120,"levelDesc":"Analyze"},{"levelId":130,"levelDesc":"Business Performance"},{"levelId":34,"levelDesc":"Commercial Services"},{"levelId":12,"levelDesc":"GPO_BI"},{"levelId":24,"levelDesc":"Insights Demo"},{"levelId":13,"levelDesc":"Manufacturing"},{"levelId":1,"levelDesc":"Plan"},{"levelId":118,"levelDesc":"Plan"},{"levelId":40,"levelDesc":"Presales"},{"levelId":190,"levelDesc":"Test Level"},{"levelId":188,"levelDesc":"testsm"},{"levelId":189,"levelDesc":"Visit"},{"levelId":25,"levelDesc":"Visualizations"}]}],"groups":null,"allLevels":[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":126,"levelDesc":"Account","levelNumber":2,"parentLevelId":126,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":78,"levelDesc":"Account Services","levelNumber":3,"parentLevelId":78,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":46,"levelDesc":"Accounts Payable / Travel & Expense","levelNumber":2,"parentLevelId":46,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":98,"levelDesc":"Accounts Payable / Travel & Expense","levelNumber":3,"parentLevelId":98,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":44,"levelDesc":"Advocacy","levelNumber":3,"parentLevelId":44,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":175,"levelDesc":"Americas_BPR","levelNumber":3,"parentLevelId":175,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":179,"levelDesc":"Americas_DO","levelNumber":3,"parentLevelId":179,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":183,"levelDesc":"Americas_ECD","levelNumber":3,"parentLevelId":183,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":120,"levelDesc":"Analyze","levelNumber":1,"parentLevelId":120,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":69,"levelDesc":"APJ Supply Chain","levelNumber":3,"parentLevelId":69,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":177,"levelDesc":"APJ_BPR","levelNumber":3,"parentLevelId":177,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":181,"levelDesc":"APJ_DO","levelNumber":3,"parentLevelId":181,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":185,"levelDesc":"APJ_ECD","levelNumber":3,"parentLevelId":185,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":65,"levelDesc":"Asset Reporting Services","levelNumber":3,"parentLevelId":65,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":16,"levelDesc":"Billings Reports","levelNumber":2,"parentLevelId":16,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":26,"levelDesc":"BOBJ","levelNumber":2,"parentLevelId":26,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":35,"levelDesc":"Bookings","levelNumber":2,"parentLevelId":35,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":15,"levelDesc":"Bookings","levelNumber":2,"parentLevelId":15,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":51,"levelDesc":"Business Data & Systems Support","levelNumber":2,"parentLevelId":51,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":77,"levelDesc":"Business Data & Systems Support","levelNumber":3,"parentLevelId":77,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":70,"levelDesc":"Business Operations Specialists","levelNumber":3,"parentLevelId":70,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":130,"levelDesc":"Business Performance","levelNumber":2,"parentLevelId":130,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":174,"levelDesc":"Business Position Reports","levelNumber":2,"parentLevelId":174,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":100,"levelDesc":"Cash Application","levelNumber":3,"parentLevelId":100,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":43,"levelDesc":"CI/Audit","levelNumber":3,"parentLevelId":43,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":19,"levelDesc":"CMC","levelNumber":2,"parentLevelId":19,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":20,"levelDesc":"CMC_Testing","levelNumber":3,"parentLevelId":20,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":101,"levelDesc":"Collections Management","levelNumber":3,"parentLevelId":101,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":34,"levelDesc":"Commercial Services","levelNumber":1,"parentLevelId":34,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":129,"levelDesc":"Compensation","levelNumber":2,"parentLevelId":129,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":38,"levelDesc":"Contracts Administration","levelNumber":3,"parentLevelId":38,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":106,"levelDesc":"Corporate Tax","levelNumber":3,"parentLevelId":106,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":119,"levelDesc":"Credit","levelNumber":1,"parentLevelId":119,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":39,"levelDesc":"Credit & Collections","levelNumber":2,"parentLevelId":39,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":102,"levelDesc":"Credit/Risk Management","levelNumber":3,"parentLevelId":102,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":146,"levelDesc":"CS All","levelNumber":3,"parentLevelId":146,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":152,"levelDesc":"CS Field","levelNumber":2,"parentLevelId":152,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":149,"levelDesc":"CS Field_CSAT","levelNumber":3,"parentLevelId":149,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":172,"levelDesc":"CS Operations","levelNumber":2,"parentLevelId":172,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":159,"levelDesc":"CS Operations_Field","levelNumber":3,"parentLevelId":159,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":168,"levelDesc":"CS Operations_RR","levelNumber":3,"parentLevelId":168,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":156,"levelDesc":"CS Programs_Field","levelNumber":3,"parentLevelId":156,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":165,"levelDesc":"CS Programs_RR","levelNumber":3,"parentLevelId":165,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":170,"levelDesc":"CS Remote Proactive","levelNumber":2,"parentLevelId":170,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":148,"levelDesc":"CS Remote Proactive_CSAT","levelNumber":3,"parentLevelId":148,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":161,"levelDesc":"CS Remote Reactive","levelNumber":2,"parentLevelId":161,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":147,"levelDesc":"CS Remote Reactive_CSAT","levelNumber":3,"parentLevelId":147,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":52,"levelDesc":"CS Support Services","levelNumber":2,"parentLevelId":52,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":145,"levelDesc":"CSAT","levelNumber":2,"parentLevelId":145,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":153,"levelDesc":"CSAT_Field","levelNumber":3,"parentLevelId":153,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":162,"levelDesc":"CSAT_RR","levelNumber":3,"parentLevelId":162,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":92,"levelDesc":"CSD Bookings Desk","levelNumber":3,"parentLevelId":92,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":171,"levelDesc":"CST","levelNumber":2,"parentLevelId":171,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":150,"levelDesc":"Customer","levelNumber":2,"parentLevelId":150,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":127,"levelDesc":"Customer","levelNumber":2,"parentLevelId":127,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":45,"levelDesc":"Customer and Professional Services","levelNumber":1,"parentLevelId":45,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":79,"levelDesc":"Customer Focus Interface","levelNumber":3,"parentLevelId":79,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":144,"levelDesc":"Customer Services","levelNumber":1,"parentLevelId":144,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":157,"levelDesc":"Customer_Field","levelNumber":3,"parentLevelId":157,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":166,"levelDesc":"Customer_RR","levelNumber":3,"parentLevelId":166,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":30,"levelDesc":"Data Governance","levelNumber":3,"parentLevelId":30,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":71,"levelDesc":"Data Science Operations","levelNumber":3,"parentLevelId":71,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":72,"levelDesc":"Deal Registration","levelNumber":3,"parentLevelId":72,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":4,"levelDesc":"Deliver","levelNumber":3,"parentLevelId":4,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":178,"levelDesc":"Delivery Operations","levelNumber":2,"parentLevelId":178,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":160,"levelDesc":"EAS_Field","levelNumber":3,"parentLevelId":160,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":169,"levelDesc":"EAS_RR","levelNumber":3,"parentLevelId":169,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":182,"levelDesc":"ECD","levelNumber":2,"parentLevelId":182,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":176,"levelDesc":"EMEA_BPR","levelNumber":3,"parentLevelId":176,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":180,"levelDesc":"EMEA_DO","levelNumber":3,"parentLevelId":180,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":184,"levelDesc":"EMEA_ECD","levelNumber":3,"parentLevelId":184,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":59,"levelDesc":"Environmental Calculations (Power Calculator)","levelNumber":3,"parentLevelId":59,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":27,"levelDesc":"Executive","levelNumber":3,"parentLevelId":27,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":143,"levelDesc":"Executive KPI’s","levelNumber":1,"parentLevelId":143,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":134,"levelDesc":"Expense","levelNumber":2,"parentLevelId":134,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":73,"levelDesc":"Field Inventory Management","levelNumber":3,"parentLevelId":73,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":139,"levelDesc":"Field-DISABLED","levelNumber":1,"parentLevelId":139,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":48,"levelDesc":"Finance","levelNumber":2,"parentLevelId":48,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":9,"levelDesc":"Finance","levelNumber":3,"parentLevelId":9,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":142,"levelDesc":"Finance-DISABLED","levelNumber":1,"parentLevelId":142,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":33,"levelDesc":"Financial Services","levelNumber":1,"parentLevelId":33,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":123,"levelDesc":"Forecast","levelNumber":2,"parentLevelId":123,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":31,"levelDesc":"GBS Analytics","levelNumber":1,"parentLevelId":31,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":18,"levelDesc":"GBS Command Center","levelNumber":1,"parentLevelId":18,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":32,"levelDesc":"GBS Management","levelNumber":1,"parentLevelId":32,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":23,"levelDesc":"GBS POC","levelNumber":3,"parentLevelId":23,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":49,"levelDesc":"General Accounting","levelNumber":2,"parentLevelId":49,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":107,"levelDesc":"General Accounting","levelNumber":3,"parentLevelId":107,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":80,"levelDesc":"Get Connected Team","levelNumber":3,"parentLevelId":80,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":37,"levelDesc":"Global Contracts Data Management","levelNumber":3,"parentLevelId":37,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":99,"levelDesc":"Global Revenue Operations","levelNumber":3,"parentLevelId":99,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":29,"levelDesc":"Go to Market","levelNumber":3,"parentLevelId":29,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":122,"levelDesc":"Goal","levelNumber":2,"parentLevelId":122,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":12,"levelDesc":"GPO_BI","levelNumber":2,"parentLevelId":12,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":97,"levelDesc":"GS RAAS","levelNumber":3,"parentLevelId":97,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":93,"levelDesc":"GSQC Tech Admin","levelNumber":3,"parentLevelId":93,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":131,"levelDesc":"GTM Performance","levelNumber":2,"parentLevelId":131,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":24,"levelDesc":"Insights Demo","levelNumber":1,"parentLevelId":24,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":95,"levelDesc":"Install Base","levelNumber":3,"parentLevelId":95,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":7,"levelDesc":"Inventory","levelNumber":3,"parentLevelId":7,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":50,"levelDesc":"Inventory","levelNumber":2,"parentLevelId":50,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":108,"levelDesc":"Inventory Returns Optimization","levelNumber":3,"parentLevelId":108,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":103,"levelDesc":"Invoicing","levelNumber":3,"parentLevelId":103,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":113,"levelDesc":"IT_Demand","levelNumber":1,"parentLevelId":113,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":155,"levelDesc":"KPI_Field","levelNumber":3,"parentLevelId":155,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":164,"levelDesc":"KPI_RR","levelNumber":3,"parentLevelId":164,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":96,"levelDesc":"Licensing","levelNumber":3,"parentLevelId":96,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":6,"levelDesc":"Make","levelNumber":3,"parentLevelId":6,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":121,"levelDesc":"Manage","levelNumber":1,"parentLevelId":121,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":13,"levelDesc":"Manufacturing","levelNumber":1,"parentLevelId":13,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":124,"levelDesc":"Market","levelNumber":2,"parentLevelId":124,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":74,"levelDesc":"Marketing Center of Excellence","levelNumber":3,"parentLevelId":74,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":141,"levelDesc":"Master-DISABLED","levelNumber":1,"parentLevelId":141,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":53,"levelDesc":"Materials Data Management","levelNumber":2,"parentLevelId":53,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":17,"levelDesc":"Miscellaneous","levelNumber":2,"parentLevelId":17,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":90,"levelDesc":"MS Operations Support","levelNumber":3,"parentLevelId":90,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":154,"levelDesc":"Open backlog_Field","levelNumber":3,"parentLevelId":154,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":163,"levelDesc":"Open backlog_RR","levelNumber":3,"parentLevelId":163,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":8,"levelDesc":"Operational Excellence","levelNumber":3,"parentLevelId":8,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":133,"levelDesc":"Operations","levelNumber":2,"parentLevelId":133,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":137,"levelDesc":"OPH","levelNumber":1,"parentLevelId":137,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":58,"levelDesc":"Other Service","levelNumber":2,"parentLevelId":58,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":54,"levelDesc":"Partner & PM Support","levelNumber":2,"parentLevelId":54,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":86,"levelDesc":"Partner Onboarding","levelNumber":3,"parentLevelId":86,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":87,"levelDesc":"Partner Operations","levelNumber":3,"parentLevelId":87,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":88,"levelDesc":"Partner Project Management Support","levelNumber":3,"parentLevelId":88,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":89,"levelDesc":"Partner Time Entry","levelNumber":3,"parentLevelId":89,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":118,"levelDesc":"Plan","levelNumber":1,"parentLevelId":118,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":116,"levelDesc":"Plan","levelNumber":1,"parentLevelId":116,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":1,"levelDesc":"Plan","levelNumber":3,"parentLevelId":1,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":136,"levelDesc":"Platforms","levelNumber":2,"parentLevelId":136,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":83,"levelDesc":"Portfolio Management Configuration Team (PMCT)","levelNumber":3,"parentLevelId":83,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":66,"levelDesc":"PPS Quoting","levelNumber":3,"parentLevelId":66,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":67,"levelDesc":"Pre/Post Deployment","levelNumber":3,"parentLevelId":67,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":2,"levelDesc":"Predictive_Analytics","levelNumber":3,"parentLevelId":2,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":40,"levelDesc":"Presales","levelNumber":2,"parentLevelId":40,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":135,"levelDesc":"Pre-Sales","levelNumber":2,"parentLevelId":135,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":128,"levelDesc":"Processing","levelNumber":2,"parentLevelId":128,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":151,"levelDesc":"Product","levelNumber":2,"parentLevelId":151,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":158,"levelDesc":"Product_Field","levelNumber":3,"parentLevelId":158,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":167,"levelDesc":"Product_RR","levelNumber":3,"parentLevelId":167,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":140,"levelDesc":"Product-DISABLED","levelNumber":1,"parentLevelId":140,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":173,"levelDesc":"Professional Services","levelNumber":1,"parentLevelId":173,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":91,"levelDesc":"Project Accounting Services","levelNumber":3,"parentLevelId":91,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":55,"levelDesc":"Project Accounting Services","levelNumber":2,"parentLevelId":55,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":85,"levelDesc":"Project Management Services","levelNumber":3,"parentLevelId":85,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":94,"levelDesc":"PS Sales Enablement Help Desk","levelNumber":3,"parentLevelId":94,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":56,"levelDesc":"PS Sales Enablement Services","levelNumber":2,"parentLevelId":56,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":28,"levelDesc":"Quality","levelNumber":3,"parentLevelId":28,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":3,"levelDesc":"Quality","levelNumber":3,"parentLevelId":3,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":60,"levelDesc":"Quoting","levelNumber":3,"parentLevelId":60,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":41,"levelDesc":"Recurring Revenue Solutions","levelNumber":2,"parentLevelId":41,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":138,"levelDesc":"Remote-DISABLED","levelNumber":1,"parentLevelId":138,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":68,"levelDesc":"Renewal Sales Quoting","levelNumber":3,"parentLevelId":68,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":75,"levelDesc":"Reporting as a Service","levelNumber":3,"parentLevelId":75,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":61,"levelDesc":"Request for Product Qualification","levelNumber":3,"parentLevelId":61,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":109,"levelDesc":"Returns Tracking Team","levelNumber":3,"parentLevelId":109,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":117,"levelDesc":"RMA Processing","levelNumber":2,"parentLevelId":117,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":14,"levelDesc":"Sales","levelNumber":1,"parentLevelId":14,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":104,"levelDesc":"Sales & Use Tax (NA only)","levelNumber":3,"parentLevelId":104,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":36,"levelDesc":"SE&M","levelNumber":2,"parentLevelId":36,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":57,"levelDesc":"Software Operations","levelNumber":2,"parentLevelId":57,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":5,"levelDesc":"Source","levelNumber":3,"parentLevelId":5,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":81,"levelDesc":"SPH & Execution Support","levelNumber":3,"parentLevelId":81,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":62,"levelDesc":"Storage Sizing","levelNumber":3,"parentLevelId":62,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":132,"levelDesc":"Strategic Programs","levelNumber":2,"parentLevelId":132,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":84,"levelDesc":"Supply Base Management Team","levelNumber":3,"parentLevelId":84,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":10,"levelDesc":"Sustain","levelNumber":3,"parentLevelId":10,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":22,"levelDesc":"Tableau","levelNumber":2,"parentLevelId":22,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":21,"levelDesc":"TCE Report","levelNumber":1,"parentLevelId":21,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":114,"levelDesc":"TCE_Testing","levelNumber":3,"parentLevelId":114,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":63,"levelDesc":"Technical Drawings","levelNumber":3,"parentLevelId":63,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":64,"levelDesc":"Technical Help Desk","levelNumber":3,"parentLevelId":64,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":125,"levelDesc":"Territory","levelNumber":2,"parentLevelId":125,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":190,"levelDesc":"Test Level","levelNumber":3,"parentLevelId":190,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":192,"levelDesc":"Tests sm","levelNumber":2,"parentLevelId":192,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":191,"levelDesc":"Testsm","levelNumber":1,"parentLevelId":191,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":188,"levelDesc":"testsm","levelNumber":3,"parentLevelId":188,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":193,"levelDesc":"testsmm","levelNumber":3,"parentLevelId":193,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":76,"levelDesc":"TRACK","levelNumber":3,"parentLevelId":76,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":82,"levelDesc":"Virtual Aid Team","levelNumber":3,"parentLevelId":82,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":189,"levelDesc":"Visit","levelNumber":2,"parentLevelId":189,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":25,"levelDesc":"Visualizations","levelNumber":2,"parentLevelId":25,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":42,"levelDesc":"VOX","levelNumber":3,"parentLevelId":42,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"rowCount":null,"deletedBy":null,"deletedDate":null,"levelId":105,"levelDesc":"Worldwide Reporting","levelNumber":3,"parentLevelId":105,"groupIds":null,"childLevelId":null,"parentLevelName":null,"deletedGroupIds":null}],"allGroups":[{"groupId":12,"groupName":"Admin","numberOfLevels":null,"buGroupName":null},{"groupId":37,"groupName":"Admin_Mobile","numberOfLevels":null,"buGroupName":null},{"groupId":49,"groupName":"Default","numberOfLevels":null,"buGroupName":null},{"groupId":19,"groupName":"GBS_Analytics","numberOfLevels":null,"buGroupName":null},{"groupId":24,"groupName":"GBS_Commercial Services","numberOfLevels":null,"buGroupName":null},{"groupId":26,"groupName":"GBS_Customer and Professional Services","numberOfLevels":null,"buGroupName":null},{"groupId":25,"groupName":"GBS_Financial Services","numberOfLevels":null,"buGroupName":null},{"groupId":18,"groupName":"GBS_Management","numberOfLevels":null,"buGroupName":null},{"groupId":11,"groupName":"Global Business Service","numberOfLevels":null,"buGroupName":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"buGroupName":null},{"groupId":32,"groupName":"GPO_BI_Development","numberOfLevels":null,"buGroupName":null},{"groupId":36,"groupName":"GPO_BI_Executive_View","numberOfLevels":null,"buGroupName":null},{"groupId":35,"groupName":"GSBI_CS","numberOfLevels":null,"buGroupName":null},{"groupId":22,"groupName":"IT_Customer","numberOfLevels":null,"buGroupName":null},{"groupId":23,"groupName":"IT_Demand","numberOfLevels":null,"buGroupName":null},{"groupId":20,"groupName":"IT_Executive","numberOfLevels":null,"buGroupName":null},{"groupId":21,"groupName":"IT_Service","numberOfLevels":null,"buGroupName":null},{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"buGroupName":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"buGroupName":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"buGroupName":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"buGroupName":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"buGroupName":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"buGroupName":null},{"groupId":9,"groupName":"Sales Ops Analyst","numberOfLevels":null,"buGroupName":null},{"groupId":10,"groupName":"Sales Ops Specialist","numberOfLevels":null,"buGroupName":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"buGroupName":null},{"groupId":34,"groupName":"Sales_General","numberOfLevels":null,"buGroupName":null},{"groupId":38,"groupName":"Sales_myPresales_GPLT","numberOfLevels":null,"buGroupName":null},{"groupId":39,"groupName":"Sales_myPresales_Managers","numberOfLevels":null,"buGroupName":null},{"groupId":33,"groupName":"Sales_Operations","numberOfLevels":null,"buGroupName":null},{"groupId":27,"groupName":"TCE_ALL","numberOfLevels":null,"buGroupName":null},{"groupId":17,"groupName":"TCE_Competitive Intelligent/Market Intelligent","numberOfLevels":null,"buGroupName":null},{"groupId":13,"groupName":"TCE_EMC Exec","numberOfLevels":null,"buGroupName":null},{"groupId":15,"groupName":"TCE_Quality","numberOfLevels":null,"buGroupName":null},{"groupId":16,"groupName":"TCE_Sales Go To Market","numberOfLevels":null,"buGroupName":null},{"groupId":30,"groupName":"TCE_Test","numberOfLevels":null,"buGroupName":null}]}']
    });
    
    $httpBackend.whenGET(/imageExistInServer\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"status":"Success","message":"The uploaded image does not exist in the server"}'];
    });
    
    $httpBackend.whenGET(/updateReport\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"status":"Success","message":"BIReport was successfully updated"}'];
    });
    
    $httpBackend.whenGET(/savereport\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"status":"Error","message":"Report File size is bigger than limit. Please link the file which size is upto 1000000 bytes"}'];
    });

    $httpBackend.whenGET(/updateReportGroupObj\/*/).respond(function (/*method, url, data*/) {
        return [200, '{"status":"Success","message":"The report group and level have been updated"}'];
    });
    
    $httpBackend.whenGET(/getParentOrChildLevel\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"levelId":13,"levelDesc":"Manufacturing","levelNumber":null,"parentLevelId":null,"groupIds":null,"childLevelId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"levelId":14,"levelDesc":"Sales","levelNumber":null,"parentLevelId":null,"groupIds":null,"childLevelId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"levelId":36,"levelDesc":"ParentLevel","levelNumber":null,"parentLevelId":null,"groupIds":null,"childLevelId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"levelId":40,"levelDesc":"SapnaParentLevel","levelNumber":null,"parentLevelId":null,"groupIds":null,"childLevelId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"levelId":42,"levelDesc":"Level100","levelNumber":null,"parentLevelId":null,"groupIds":null,"childLevelId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"levelId":43,"levelDesc":"Global Services 1","levelNumber":null,"parentLevelId":null,"groupIds":null,"childLevelId":null},{"createdBy":null,"createdDate":null,"updatedBy":null,"updatedDate":null,"levelId":44,"levelDesc":"Global Services 2","levelNumber":null,"parentLevelId":null,"groupIds":null,"childLevelId":null}]'];
    });
    
    $httpBackend.whenGET(/getBILevelForEdit\/*/).respond(function (/*method, url, data*/) {
//        return [200, '{"createdBy":0,"createdDate":null,"updatedBy":0,"updatedDate":null,"rowCount":null,"levelId":113,"levelDesc":"IT_Demand","levelNumber":1,"parentLevelId":0,"groupIds":"20,21,22,23","childLevelId":null,"parentLevelName":null,"deletedGroupIds":null,"parentLevelList":null,"childLevelList":null,"groupNames":"IT_Executive,IT_Service,IT_Customer,IT_Demand","allGroups":[{"groupId":12,"groupName":"Admin","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":0,"groupName":"Default","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":19,"groupName":"GBS_Analytics","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":24,"groupName":"GBS_Commercial Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":26,"groupName":"GBS_Customer and Professional Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":25,"groupName":"GBS_Financial Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":18,"groupName":"GBS_Management","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":11,"groupName":"Global Business Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":22,"groupName":"IT_Customer","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":23,"groupName":"IT_Demand","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":20,"groupName":"IT_Executive","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":21,"groupName":"IT_Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":9,"groupName":"Sales Ops Analyst","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":10,"groupName":"Sales Ops Specialist","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":27,"groupName":"TCE_ALL","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":17,"groupName":"TCE_Competitive Intelligent/Market Intelligent","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":13,"groupName":"TCE_EMC Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":15,"groupName":"TCE_Quality","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":16,"groupName":"TCE_Sales Go To Market","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":36,"groupName":"test","numberOfLevels":null,"levels":null,"levelMaps":null}]}'];
        return [200, '{"createdBy":0,"createdDate":null,"updatedBy":0,"updatedDate":null,"rowCount":null,"levelId":113,"levelDesc":"IT_Demand","levelNumber":1,"parentLevelId":0,"groupIds":"","childLevelId":null,"parentLevelName":null,"deletedGroupIds":null,"parentLevelList":null,"childLevelList":null,"groupNames":"IT_Executive,IT_Service,IT_Customer,IT_Demand","allGroups":[{"groupId":12,"groupName":"Admin","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":0,"groupName":"Default","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":19,"groupName":"GBS_Analytics","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":24,"groupName":"GBS_Commercial Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":26,"groupName":"GBS_Customer and Professional Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":25,"groupName":"GBS_Financial Services","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":18,"groupName":"GBS_Management","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":11,"groupName":"Global Business Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":22,"groupName":"IT_Customer","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":23,"groupName":"IT_Demand","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":20,"groupName":"IT_Executive","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":21,"groupName":"IT_Service","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":9,"groupName":"Sales Ops Analyst","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":10,"groupName":"Sales Ops Specialist","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":27,"groupName":"TCE_ALL","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":17,"groupName":"TCE_Competitive Intelligent/Market Intelligent","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":13,"groupName":"TCE_EMC Exec","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":15,"groupName":"TCE_Quality","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":16,"groupName":"TCE_Sales Go To Market","numberOfLevels":null,"levels":null,"levelMaps":null},{"groupId":36,"groupName":"test","numberOfLevels":null,"levels":null,"levelMaps":null}]}'];
    });
    
    $httpBackend.whenGET(/getBUGroup\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"buGroupId":1,"buGroupName":"Sales"},{"buGroupId":2,"buGroupName":"TCE"}]'];
    });
    
    $httpBackend.whenGET(/getNotificationList\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"notificationId":30,"reportId":null,"groupId":12,"header":"GBS_Analytics test","messageBody":"tests","notificationType":"A","isActive":"N","biCreatedBy":null,"biCreatedDate":1479302566327,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":28,"reportId":null,"groupId":37,"header":"First","messageBody":"First Message body","notificationType":"M","isActive":"N","biCreatedBy":null,"biCreatedDate":1479294535890,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin_Mobile","owner":"Sarunkumar Moorthy"},{"notificationId":25,"reportId":null,"groupId":12,"header":"GBS_Analytics test","messageBody":"tests sm","notificationType":"A","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479276430327,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":23,"reportId":null,"groupId":37,"header":"Saim is Great","messageBody":"So is Sarun","notificationType":"M","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479222641060,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin_Mobile","owner":"Sridharan Narayanan"},{"notificationId":22,"reportId":null,"groupId":19,"header":"Admin Test","messageBody":"Alert tests","notificationType":"M","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479195224613,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"GBS_Analytics","owner":"Sk Mahammad Saim"},{"notificationId":21,"reportId":null,"groupId":12,"header":"GBS_Analytics test","messageBody":"tests","notificationType":"A","isActive":"N","biCreatedBy":null,"biCreatedDate":1479232981073,"biUpdatedBy":null,"biUpdatedDate":1479291876213,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":20,"reportId":null,"groupId":19,"header":"Admin Test","messageBody":"Alert tests","notificationType":"M","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479195145860,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"GBS_Analytics","owner":"Sk Mahammad Saim"},{"notificationId":19,"reportId":null,"groupId":19,"header":"Admin Test","messageBody":"Alert tests","notificationType":"A","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479195076360,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"GBS_Analytics","owner":"Sk Mahammad Saim"},{"notificationId":18,"reportId":null,"groupId":12,"header":"Admin Test","messageBody":"Alert tests","notificationType":"A","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479195049047,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":17,"reportId":null,"groupId":1,"header":"Admin Test","messageBody":"Alert tests","notificationType":"A","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479106068473,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Manufacturing","owner":"Sk Mahammad Saim"},{"notificationId":16,"reportId":null,"groupId":19,"header":"Admin Test","messageBody":"Alert tests","notificationType":"A","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479105335927,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"GBS_Analytics","owner":"Sk Mahammad Saim"},{"notificationId":15,"reportId":null,"groupId":19,"header":"Admin Test","messageBody":"Message tests","notificationType":"M","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479105325897,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"GBS_Analytics","owner":"Sk Mahammad Saim"},{"notificationId":14,"reportId":null,"groupId":19,"header":"Admin Test","messageBody":"Task tests","notificationType":"T","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479105312833,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"GBS_Analytics","owner":"Sk Mahammad Saim"},{"notificationId":13,"reportId":null,"groupId":12,"header":"Admin Test","messageBody":"Task tests","notificationType":"T","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479105175360,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":12,"reportId":null,"groupId":12,"header":"Admin Test","messageBody":"Message tests","notificationType":"M","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479105160343,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":11,"reportId":null,"groupId":12,"header":"Admin Test","messageBody":"tests","notificationType":"M","isActive":"Y","biCreatedBy":null,"biCreatedDate":1479105137123,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":10,"reportId":null,"groupId":12,"header":"GBS_Analytics test","messageBody":"tests","notificationType":"A","isActive":"Y","biCreatedBy":null,"biCreatedDate":1478868509117,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":9,"reportId":null,"groupId":12,"header":"GBS_Analytics test","messageBody":"tests","notificationType":"T","isActive":"Y","biCreatedBy":null,"biCreatedDate":1478864147700,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":8,"reportId":null,"groupId":12,"header":"GBS_Analytics test","messageBody":"tests","notificationType":"T","isActive":"Y","biCreatedBy":null,"biCreatedDate":1478898316143,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"},{"notificationId":7,"reportId":null,"groupId":12,"header":"GBS_Analytics test","messageBody":"tests","notificationType":"T","isActive":"Y","biCreatedBy":null,"biCreatedDate":1478897898913,"biUpdatedBy":null,"biUpdatedDate":null,"biDeletedBy":null,"biDeletedDate":null,"persona":"Admin","owner":"Sk Mahammad Saim"}]'];
    });
    
    $httpBackend.whenGET(/getBUAdminGroupByRole\/*/).respond(function (/*method, url, data*/) {
        return [200, '[{"groupId":12,"groupName":"Admin","numberOfLevels":null,"buGroupName":null},{"groupId":37,"groupName":"Admin_Mobile","numberOfLevels":null,"buGroupName":null},{"groupId":49,"groupName":"Default","numberOfLevels":null,"buGroupName":null},{"groupId":19,"groupName":"GBS_Analytics","numberOfLevels":null,"buGroupName":null},{"groupId":24,"groupName":"GBS_Commercial Services","numberOfLevels":null,"buGroupName":null},{"groupId":26,"groupName":"GBS_Customer and Professional Services","numberOfLevels":null,"buGroupName":null},{"groupId":25,"groupName":"GBS_Financial Services","numberOfLevels":null,"buGroupName":null},{"groupId":18,"groupName":"GBS_Management","numberOfLevels":null,"buGroupName":null},{"groupId":11,"groupName":"Global Business Service","numberOfLevels":null,"buGroupName":null},{"groupId":2,"groupName":"Global Service","numberOfLevels":null,"buGroupName":null},{"groupId":32,"groupName":"GPO_BI_Development","numberOfLevels":null,"buGroupName":null},{"groupId":36,"groupName":"GPO_BI_Executive_View","numberOfLevels":null,"buGroupName":null},{"groupId":35,"groupName":"GSBI_CS","numberOfLevels":null,"buGroupName":null},{"groupId":22,"groupName":"IT_Customer","numberOfLevels":null,"buGroupName":null},{"groupId":23,"groupName":"IT_Demand","numberOfLevels":null,"buGroupName":null},{"groupId":20,"groupName":"IT_Executive","numberOfLevels":null,"buGroupName":null},{"groupId":21,"groupName":"IT_Service","numberOfLevels":null,"buGroupName":null},{"groupId":1,"groupName":"Manufacturing","numberOfLevels":null,"buGroupName":null},{"groupId":3,"groupName":"Sales AM","numberOfLevels":null,"buGroupName":null},{"groupId":4,"groupName":"Sales DM","numberOfLevels":null,"buGroupName":null},{"groupId":5,"groupName":"Sales DVP","numberOfLevels":null,"buGroupName":null},{"groupId":7,"groupName":"Sales Exec","numberOfLevels":null,"buGroupName":null},{"groupId":6,"groupName":"Sales Non Core","numberOfLevels":null,"buGroupName":null},{"groupId":9,"groupName":"Sales Ops Analyst","numberOfLevels":null,"buGroupName":null},{"groupId":10,"groupName":"Sales Ops Specialist","numberOfLevels":null,"buGroupName":null},{"groupId":8,"groupName":"Sales Rep","numberOfLevels":null,"buGroupName":null},{"groupId":34,"groupName":"Sales_General","numberOfLevels":null,"buGroupName":null},{"groupId":38,"groupName":"Sales_myPresales_GPLT","numberOfLevels":null,"buGroupName":null},{"groupId":39,"groupName":"Sales_myPresales_Managers","numberOfLevels":null,"buGroupName":null},{"groupId":33,"groupName":"Sales_Operations","numberOfLevels":null,"buGroupName":null},{"groupId":27,"groupName":"TCE_ALL","numberOfLevels":null,"buGroupName":null},{"groupId":17,"groupName":"TCE_Competitive Intelligent/Market Intelligent","numberOfLevels":null,"buGroupName":null},{"groupId":13,"groupName":"TCE_EMC Exec","numberOfLevels":null,"buGroupName":null},{"groupId":15,"groupName":"TCE_Quality","numberOfLevels":null,"buGroupName":null},{"groupId":16,"groupName":"TCE_Sales Go To Market","numberOfLevels":null,"buGroupName":null},{"groupId":30,"groupName":"TCE_Test","numberOfLevels":null,"buGroupName":null}]'];
    });
}]);

'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('AboutCtrl', ["$scope", "$http", "$filter", "$uibModal", "$q", "$timeout", "userDetailsService", function ($scope, $http, $filter, $uibModal, $q, $timeout, userDetailsService) {
    $scope.displayType = '';
    $scope.personaId = '';
    $scope.searchTextValue = '';
    $scope.functionalArea = '';
    $scope.reportType = '';
    $scope.sourceSystem = '';
    var searchPromises = [];
    $scope.$emit('resetDisplayType', 'All');
    $scope.$emit('resetSearchText');
    $scope.isBUFlag = false;
    
    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.columnDefs
     * @description
     * Columns options defiened, returns an array of columns definition objects. Each object allows you to assign specific options to columns in the table.
     * Please refer link: https://github.com/angular-ui/ui-grid/wiki/defining-columns
     */
    function columnDefs() {
        return [
            {name: 'radiobutton', displayName: '', width: 25, enableSorting: false, cellTemplate: '<div><input ng-checked="row.isSelected"   name="radioButton" type="radio" ng-value="row.entity.sourceReportId" > </div>'},
            {name: 'id', displayName: 'Report ID', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportName', displayName: 'Report Name', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'sourceSystem', displayName: 'Source System', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'reportDesc', displayName: 'Description', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportType', displayName: 'Type', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'functionalArea', displayName: 'Functional Area', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'owner', displayName: 'Owner', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'additionalInfo', displayName: 'Additional Info', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'updatedDate', displayName: 'Updated Date', enableCellEdit: false, width: '200', cellTooltip: true}
        ];
    }

    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.onRegisterApi
     * @description
     * A callback that returns the gridApi once the grid is instantiated, which is then used to interact with the grid programatically.
     * Note that the gridApi.core.renderingComplete event is identical to this callback, but has the advantage that it can be called from multiple places if needed
     */
    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateReportForm);

        //Click on each row of table.
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            var promiseObj = $scope.open(angular.copy(row.entity));
            promiseObj.then(function (resp) {
                row.entity = resp;
            });
        });
    }
    
    //Properties for Ui grid.
    $scope.myData = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };
    
    $scope.$on('userObjectBroadCast', function(userObject) {
        $scope.userObject = userObject;
    });
    
    //Modal open callBack.
    $scope.open = function (row) {
        var defer = $q.defer();
        row.isBUFlag = $scope.isBUFlag;
        console.log(row);
        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal.html',
            controller: 'ModalCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return row;
                }
            }
        });
        
        modalInstance.result.then(function (returnObj) {
            $scope.myData.data = [];
            $scope.updateReportForm();
        }, function () {
            //OnCancel
        });
        return defer.promise;
    };

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
    
    $scope.$on('reportGroupList', function (event, list) {
        _.map(list, function(item) {
            if(item.buGroupName.toLowerCase() == 'sales'){
                $scope.isBUFlag = true;
            }
        })
    });
    
    $scope.$on('searchTextUpdate', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('funcAreaUpdate', function (event, funcArea) {
        $scope.functionalArea = funcArea;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('reportTypeUpdate', function (event, reportType) {
        $scope.reportType = reportType;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });

    $scope.$on('sourceSystemUpdate', function (event, sourceSystem) {
        $scope.sourceSystem = sourceSystem;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });

    $scope.$on('broadcastDeployedSelection', function (event, displayType, personaId) {
        $scope.displayType = (displayType === 'All')? '' : displayType;
        $scope.personaId = personaId;
        $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('broadcastDeployedReportGroup', function (event, displayType, personaId) {
        $scope.displayType = displayType;
        $scope.personaId = personaId;
        $scope.downloadEntDeployedReport = '/BITool/admin/downloadEntDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.updateReportForm = function () {
        userDetailsService.userPromise.then(function (userObject) {
            var offset = $scope.myData.data.length + 1;
            var promise = $q.defer();
            //for cancelling the running service.
            var canceller = $q.defer();
            
            if($scope.displayType === 'Deployed') {
                $scope.sourceSystem = ''
                $scope.functionalArea = ''
                $scope.reportType = '';
                var url = ($scope.personaId) ? 'BITool/admin/allReports/' + userObject[0].emcLoginName + '/' + offset + '/20?searchText=' + $scope.searchTextValue + '&searchTextSourceSystem=' + $scope.sourceSystem + '&searchTextReportType=' + $scope.reportType + '&searchTextFunctionalArea=' + $scope.functionalArea +'&displayType=' + $scope.displayType+'&personaId=' + $scope.personaId : 'BITool/admin/allReports/' + userObject[0].emcLoginName + '/' + offset + '/20?searchText=' + $scope.searchTextValue + '&searchTextSourceSystem=' + $scope.sourceSystem + '&searchTextReportType=' + $scope.reportType + '&searchTextFunctionalArea=' + $scope.functionalArea +'&displayType=' + $scope.displayType;
            } else {
                var url = 'BITool/admin/allReports/' + userObject[0].emcLoginName + '/' + offset + '/20?searchText=' + $scope.searchTextValue + '&searchTextSourceSystem=' + $scope.sourceSystem + '&searchTextReportType=' + $scope.reportType + '&searchTextFunctionalArea=' + $scope.functionalArea +'&displayType=' + $scope.displayType;
            }
            
            var httpPromise = $http({
                'url': url,
                'method': 'get',
                'timeout': canceller.promise
            }).then(function (resp) {

                if ($scope.myData.data.length === 0) {
                    $scope.myData.data = resp.data;
                } else {
                    $scope.myData.data = $scope.myData.data.concat(resp.data);
                }

                $scope.gridApi.infiniteScroll.saveScrollPercentage();
                $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function () {
                    promise.resolve();

                });
            });
            
            httpPromise.cancelService = function () {
                canceller.resolve();
            };
            
            searchPromises.push(httpPromise);
            return promise.promise;
        });
    };
    
    $scope.updateReportForm();
}]);
'use strict';

/**
 * @ngdoc service
 * @name adminPageApp.about.js
 * @description
 * # about.js
 * Service in the adminPageApp.
 */
angular.module('adminPageApp')
.service('aboutService', ["$q", "$http", function ($q, $http) {
    var defer = $q.defer();
    var myData = '[{"sourceReportId":"101123","reportName":"TBxxx_Introduction","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/SchedulingToolMock1212015/TBxxx_Introduction","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"Scheduling Tool Mock 1 21 2015","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 23, 2015 00:00:00 AM","updatedDate":"Jan 23, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"17947","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":3},{"sourceReportId":"101124","reportName":"TBxxx_Scheduling Guidance Tool","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/SchedulingToolMock1212015/TBxxx_SchedulingGuidanceTool","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"Scheduling Tool Mock 1 21 2015","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 23, 2015 00:00:00 AM","updatedDate":"Jan 23, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"17947","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":3},{"sourceReportId":"101125","reportName":"TBxxx_Scheduling Guidance Tool 2","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/SchedulingToolMock1212015/TBxxx_SchedulingGuidanceTool2","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"Scheduling Tool Mock 1 21 2015","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 23, 2015 00:00:00 AM","updatedDate":"Jan 23, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"17947","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":3},{"sourceReportId":"101126","reportName":"TBxxx_Scheduling Guidance Tool 3","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/SchedulingToolMock1212015/TBxxx_SchedulingGuidanceTool3","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"Scheduling Tool Mock 1 21 2015","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 23, 2015 00:00:00 AM","updatedDate":"Jan 23, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"17947","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":2},{"sourceReportId":"101127","reportName":"TBxxx_Scheduling Guidance Tool 4","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/SchedulingToolMock1212015/TBxxx_SchedulingGuidanceTool4","functionalArea":"GS_BI","functionalAreaLvl1":"Development","functionalAreaLvl2":"Scheduling Tool Mock 1 21 2015","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 23, 2015 00:00:00 AM","updatedDate":"Jan 23, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"17947","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":2},{"sourceReportId":"101998","reportName":"TB097_Introduction","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/TB097_KCSDashboard_0/TB097_Introduction","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB097_KCS Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 28, 2015 00:00:00 AM","updatedDate":"Mar 30, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"18123","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":9},{"sourceReportId":"101999","reportName":"TB097_Introduction Continued","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/TB097_KCSDashboard_0/TB097_IntroductionContinued","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB097_KCS Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 28, 2015 00:00:00 AM","updatedDate":"Mar 30, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"18123","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":4},{"sourceReportId":"102000","reportName":"TB097_KCS SR Metrics","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/TB097_KCSDashboard_0/TB097_KCSSRMetrics","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB097_KCS Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 28, 2015 00:00:00 AM","updatedDate":"Mar 30, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"18123","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":17},{"sourceReportId":"102001","reportName":"TB097_KCS Snapshot","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/TB097_KCSDashboard_0/TB097_KCSSnapshot","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB097_KCS Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 28, 2015 00:00:00 AM","updatedDate":"Mar 30, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"18123","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":14},{"sourceReportId":"102002","reportName":"TB097_KCS RO Exception","reportType":"active","owner":"martim29","reportDesc":null,"reportLink":"https://tabwebsbx01.corp.emc.com/#/site/GS_BI/views/TB097_KCSDashboard_0/TB097_KCSROException","functionalArea":"GS_BI","functionalAreaLvl1":"CS Remote Ops Managers","functionalAreaLvl2":"TB097_KCS Dashboard","linkTitle":" ","linkHoverInfo":" ","createdDate":"Jan 28, 2015 00:00:00 AM","updatedDate":"Mar 30, 2015 00:00:00 AM","sourceSystem":"BAaaS Tableau-SBX","additionalInfo":"18123","systemDescription":"BAaaS Taleau Instance-SBX","viewCount":10}]';

    defer.resolve({
        'data': myData,
        'config': [],
    });
    
    //return defer.promise
    return $http.get('BITool/admin/allReports/saxenr3/1/10?searchText=site&searchTextOwner=martim29');
}]);

'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ModalCtrl', ["$scope", "$uibModalInstance", "items", "$http", "$q", function ($scope, $uibModalInstance, items, $http, $q) {
    
    if(items.sourceSystem === 'EXTERNAL')  {
        $scope.exFlag = true;
    } else {
        $scope.exFlag = false;
    }
    
    $scope.items = items;
    $scope.headerFlag = ((items.isBUFlag && $scope.userObject.userinfo.role.toLowerCase() === 'buadmin')|| $scope.userObject.userinfo.role.toLowerCase() === 'admin')? true : false;
    
    $scope.levelGroupMaps = [{
        'selectedlevel': 0,
        'selectedgroup': 0
    }];
    
    $scope.oldList = [];
    $scope.deletedLevelAndGroupIds = [];
    $scope.updatefields = true;
    $scope.progress = false;
    $scope.saveText = '';
    $scope.tabchange = function (val) {
        $scope.updatefields = val;
        $scope.saveText = '';
    };
    
    if ($scope.exFlag) {
        delete $scope.items.createdBy;
        delete $scope.items.updatedBy;
        delete $scope.items.groupId;
        delete $scope.items.groupName;
        var getReportDetails = $http.get('BITool/admin/externalrepo/searchreport/' + $scope.items.sourceReportId);
    } else {
        var getReportDetails = $http.get('BITool/admin/getReport/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem);
    }
    
    if($scope.items.id) {
        var getReportLevelGroup = $http.get('BITool/admin/getLevelAndGroup/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem+ '?reportId=' + $scope.items.id);
    } else {
        var getReportLevelGroup = $http.get('BITool/admin/getLevelAndGroup/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem);
    }
    
    getReportDetails.then(function (response) {
        var resp = response.data;
        $scope.items.owner = resp.owner;
        $scope.items.reportDesc = resp.reportDesc;
        $scope.items.refreshStatus = (resp.refreshStatus) ? resp.refreshStatus : 'N';
        $scope.items.tabbedViews = (resp.tabbedViews) ? resp.tabbedViews : 'N';
        //$scope.items.recommended = (resp.recommended)? resp.recommended : 'N';
        $scope.items.reportLink = resp.reportLink;
        $scope.items.functionalArea = resp.functionalArea;
        $scope.items.functionalAreaLvl1 = resp.functionalAreaLvl1;
        $scope.items.functionalAreaLvl2 = resp.functionalAreaLvl2;
        $scope.items.linkTitle = resp.linkTitle;
        $scope.items.linkHoverInfo = resp.linkHoverInfo;
        $scope.items.createdDate = resp.createdDate;
        $scope.items.updatedDate = resp.updatedDate;
        $scope.items.sourceSystem = resp.sourceSystem;
        $scope.items.viewCount = resp.viewCount;
        $scope.items.additionalInfo = resp.additionalInfo;
        $scope.items.systemDescription = resp.systemDescription;
        $scope.items.reportName = resp.reportName;
        $scope.items.reportType = resp.reportType;
        $scope.items.displayType = resp.displayType;
        $scope.items.isHeaderFlag = resp.isHeaderFlag;
        $scope.items.displayType = ($scope.items.displayType === null) ? 'B' : $scope.items.displayType;
        $scope.items.isHeaderFlag = ($scope.items.isHeaderFlag === null) ? '1' : $scope.items.isHeaderFlag.toString();
        $scope.isHeaderVal = $scope.items.isHeaderFlag;
    })
    .finally(function () {
        getReportLevelGroup.then(function (response) {
            $scope.levelGroup = response.data;
            var maps = _.map($scope.levelGroup.levelAndGroupIds, function (eachMap) {
                return {
                    'selectedlevel': parseInt(eachMap.levelId),
                    'selectedgroup': eachMap.groupId,
                    'recommendedSeq': eachMap.recommendedSeq
                };
            });
            if (maps.length > 0) {
                $scope.levelGroupMaps = maps;
                $scope.oldList = $scope.levelGroup.levelAndGroupIds;
            }
        });
    });

    $scope.addLevelGroup = function () {
        $scope.levelGroupMaps.push({
            'selectedlevel': 0,
            'selectedgroup': 0,
            'recommendedSeq': null
        });
    };
    
    $scope.removeLevelGroup = function (index) {
        if (index > -1) {
            var rowVal = {
                'levelId': 0,
                'groupId': 0,
                'recommendedSeq':null
            };
            rowVal.levelId = $scope.levelGroupMaps[index].selectedlevel;
            rowVal.groupId = $scope.levelGroupMaps[index].selectedgroup;
            rowVal.recommendedSeq = $scope.levelGroupMaps[index].recommendedSeq;
            $scope.deletedLevelAndGroupIds.push(rowVal);
            $scope.levelGroupMaps.splice(index, 1);
        }
    };

    $scope.ok = function () {
        $scope.items = _.omit($scope.items,'isBUFlag');
        $scope.items.isHeaderFlag = parseInt($scope.isHeaderVal, 10);
        
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        
        console.log(returnObj);
        $scope.saveText = 'saving...';
        $scope.progress = true;
        if ($scope.updatefields) {
            $http.put("BITool/admin/updateReport", $scope.items)
                .then(function (updatedData, status, headers) {
                    $scope.isHeaderVal.toString();
                    $scope.progress = false;
                    $scope.saveText = updatedData.data.message;
                    $scope.items.id = updatedData.data.id;
                    updateGroupsAndLevels($scope.items.id);
                }, function (updatedData, status, headers, config) {
                    $scope.progress = false;
                    $scope.saveText = updatedData.data.message;
                });
        } else {
            var groupsandlevels = {
                'sourceReportId': $scope.items.sourceReportId,
                'sourceSystem': $scope.items.sourceSystem,
                'levelAndGroupIds': [],
                'deletedLevelAndGroupIds':[],
                'biReportId': ($scope.items.id)? $scope.items.id : null 
            };
            for (var i = 0; i < $scope.levelGroupMaps.length; i++) {    
                var levelGroupMap = {
                    'levelId': 0,
                    'groupId': 0
                };
                if ($scope.levelGroupMaps[i].selectedlevel && $scope.levelGroupMaps[i].selectedgroup) {
                    // groupsandlevels.levelAndGroupIds[$scope.levelGroupMaps[i].selectedgroup]=$scope.levelGroupMaps[i].selectedlevel;
                    levelGroupMap.levelId = $scope.levelGroupMaps[i].selectedlevel;
                    levelGroupMap.groupId = $scope.levelGroupMaps[i].selectedgroup;
                    levelGroupMap.recommendedSeq = $scope.levelGroupMaps[i].recommendedSeq;
                    groupsandlevels.levelAndGroupIds.push(levelGroupMap);
                }
            }
            
            groupsandlevels.deletedLevelAndGroupIds = getDifference($scope.oldList, groupsandlevels.levelAndGroupIds);
            
            $http.put("BITool/admin/updateReportGroupObj", groupsandlevels).then(function (resp) {
                $scope.oldList = groupsandlevels.levelAndGroupIds;
                $scope.deletedLevelAndGroupIds = [];
                $scope.progress = false;
                $scope.saveText = resp.data.message;
            }, function (resp) {
                $scope.progress = false;
                $scope.saveText = resp.data.message;;
            });
        }
        //$uibModalInstance.close(returnObj);
    };

    $scope.cancel = function () {
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $uibModalInstance.close(returnObj);
    };
    
    function getDifference(oldList, newList) {
        return _.filter(oldList, function(val){
            return !_.findWhere(newList,  val);
        });
    }
    
    function updateGroupsAndLevels(id) {
        var getReportLevelGroup = $http.get('BITool/admin/getLevelAndGroup/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem+ '?reportId=' + id);
        getReportLevelGroup.then(function (response) {
            $scope.levelGroup = response.data;
            var maps = _.map($scope.levelGroup.levelAndGroupIds, function (eachMap) {
                return {
                    'selectedlevel': parseInt(eachMap.levelId),
                    'selectedgroup': eachMap.groupId,
                    'recommendedSeq': eachMap.recommendedSeq
                };
            });
            if (maps.length > 0) {
                $scope.levelGroupMaps = maps;
                $scope.oldList = $scope.levelGroup.levelAndGroupIds;
            }
        });
    }
}]);
'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:HeaderCtrl
 * @description
 * # HeaderCtrl
 * Controller of the myBiApp
 */
angular.module('adminPageApp')
.controller('RootCtrl', ["$scope", "$http", "$log", "$q", "userDetailsService", "commonService", "$state", "$window", "$rootScope", function ($scope, $http, $log, $q, userDetailsService, commonService, $state, $window, $rootScope) {
    $scope.state = $state;
    $scope.displayType = 'All';
    $scope.displayForm = 'edit';
    $scope.selectedAuditGroup  = {};
    $scope.selectedUserGroup = {};
    $scope.selectedReportGroup ={};
    $scope.badge = '0%';
    $scope.showIcon = false;
    
    checkUserExist();
    
    function checkUserExist() {
        $http.get('BITool/userExistInBITool').then(function(response) {
            if(response.data && response.data.isApplicationRunning === false) {
                $window.location.href ='../maintenance/index.html';
            }
        });
    }
    
    /**
     *Update my level indication
     */
    $scope.badgePercentage = {
        'Bronze': '25%',
        'Silver': '50%',
        'Gold': '75%',
        'Platinum': '100%'
    };
    
    
    $scope.$on('resetDisplayType', function(event, value) {
        $scope.displayType = value;
        $scope.selectedReportGroup = {};
    });
    
    $scope.$on('resetDisplayForm', function(event, value) {
        $scope.displayForm = value;
    });
    
    $scope.$on('resetSearchText', function() {
        $scope.searchText = '';
        $scope.showIcon = false;
    });
    
    $scope.$on('resetGroup', function() {
        $scope.selectedAuditGroup  = {};
    });
    
    $scope.showIconFlag = function() {
        ($scope.searchText && $scope.searchText !== '') ? $scope.showIcon = true : $scope.showIcon = false; 
    }
    
    $scope.resetSearch = function() {
        $scope.showIcon = false;
        $scope.searchText = '';
        $scope.submitSearch($state.current.name)
    }
    userDetailsService.userPromise.then(function (userObject) {
        $rootScope.userObject = $scope.userObject = userObject[0];
        $scope.$broadcast('userObjectDetails', userObject[0]);
        $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
        $scope.badge = $scope.badgePercentage[$scope.userObject.userinfo.badge];
        var url;
        
        if ($scope.userObject.userinfo && $scope.userObject.userinfo.role.toLowerCase() === 'admin' ) {
            url = 'BITool/buAdmin/getBUAdminGroup/?userName=';
        } else if ($scope.userObject.userinfo && $scope.userObject.userinfo.role.toLowerCase() === 'buadmin') {
            url = 'BITool/buAdmin/getBIGroupForBUAdmin/?userName=';
        }
        
        url = url+$scope.userObject.emcLoginName;
        
        $http.get(url).then(function(resp){
            $scope.reportGroup = _.sortBy(resp.data, 'groupName');
            $scope.$broadcast('reportGroupList', $scope.reportGroup);
        });
    });

    /**
     * Common Search in all pages
     */
    $scope.submitSearch = function (stateName) {
        if (stateName === 'contents' || 
            stateName === 'external' || 
            stateName === 'administration.list.manageExternal' ||
            stateName === 'administration.list.notification') {
            $scope.selectedFuncArea = '';
            $scope.selectedOwner = '';
            $scope.selectedReportName = '';
            $scope.searchText = $scope.searchText ? $scope.searchText : '';
            $scope.$broadcast('searchTextUpdate', $scope.searchText);
        } else if (stateName === 'administration.list.news') {
            $scope.$broadcast('searchNews', $scope.searchText);
        } else if (stateName === 'administration.list.communication') {
            $scope.$broadcast('searchCommunication', $scope.searchText);
        } else if (stateName === 'administration.list.groups') {
            $scope.$broadcast('searchGroup', $scope.searchText);
        } else if (stateName === 'administration.list.levels') {
            $scope.$broadcast('searchLevel', $scope.searchText);
        } else if (stateName === 'administration.list.users') {
            $scope.$broadcast('searchUsers', $scope.searchText);
        } else if (stateName === 'administration.list.audit') {
            $scope.$broadcast('searchReportAudit', $scope.searchText);
        }
    };

    $scope.selectedFunctionalArea = function (a, b) {
        $scope.$broadcast('funcAreaUpdate', a.functionalArea);
    };

    $scope.changeReportType = function (a, b) {
        $scope.$broadcast('reportTypeUpdate', a.reportType);
    };

    $scope.changeSourceSystem = function (a, b) {
        $scope.$broadcast('sourceSystemUpdate', a.sourceSystem);
    };

    $scope.changeAuditPersona = function () {
        $scope.$broadcast('broadcastAuditPersona', $scope.selectedAuditPersona);
    };
    
//    $scope.changeAuditGroup = function ( {
//        $scope.$broadcast('broadcastAuditGroup', $scope.selectedAuditGroup);
//    };
    
    $scope.changeAuditGroup = function (a, b) {
        $scope.$broadcast('broadcastAuditGroup', a.groupId);
    };

    $scope.$on('emitAuditGroup', function (event, auditGroups) {
        $scope.auditGroups = auditGroups;
    });

//    $scope.changeUserGroup = function () {
//        $scope.$broadcast('broadcastUserGroup', $scope.selectedUserGroup);
//    };
//
//    $scope.$on('emitUserGroup', function (event, userGroup, defaultUserGroup) {
//        $scope.userGroup = userGroup;
//        $scope.selectedUserGroup = defaultUserGroup.groupId;
//    });
    
    $scope.changeUserGroup = function (a,b) {
        $scope.$broadcast('broadcastUserGroup', a.groupId);
    };

    $scope.$on('emitUserGroup', function (event, userGroup, defaultUserGroup) {
        $scope.userGroup = userGroup;
        $scope.selectedUserGroup = {selected  : defaultUserGroup};
    });
    
    $scope.displayContent = function(val) {
        $scope.displayType = val;
        $scope.selectedReportGroup = {}
        resetDropdown();
        $scope.$broadcast('broadcastDeployedSelection', $scope.displayType, '');
    };
    
//    $scope.changeReportGroup = function() {
//        $scope.$broadcast('broadcastDeployedReportGroup', $scope.displayType, $scope.selectedReportGroup);
//    };
    
    $scope.changeReportGroup = function(a, b) {
        $scope.$broadcast('broadcastDeployedReportGroup', $scope.displayType, a.groupId);
    };
    
    $scope.showForm = function(displayForm) {
        $scope.displayForm = displayForm;
        $scope.$emit('emitDisplayForm', $scope.displayForm);
    };

    $scope.functionalAreas = [];
    $scope.reportTypes = [];
    $scope.sourceSystems = [];
    
    /**
     * Filters in content page
     */
    
    function resetDropdown() {
        $scope.selectedFuncArea = {};
        $scope.selectedSourceSystem = {};
        $scope.selectedReportType = {};
    }
    
    resetDropdown();
    
    $scope.refreshFunctionalAreas = function (fa) {
        return $scope.state.current.name === 'contents' ? $http.get('BITool/admin/getFunctionalArea/1/20', {searchText: fa}).then(function (resp) {
            $scope.functionalAreas = resp.data;
        }) : [];
    };

    $scope.refreshReportTypes = function (fa) {
        return $scope.state.current.name === 'contents' ? $http.get('BITool/admin/getReportType/1/20', {searchText: fa}).then(function (resp) {
            $scope.reportTypes = resp.data;
        }) : [];
    };

    $scope.refreshSourceSystems = function (fa) {
        return $scope.state.current.name === 'contents' ? $http.get('BITool/admin/getSourceSystem/1/20', {searchText: fa}).then(function (resp) {
            $scope.sourceSystems = resp.data;
        }) : [];
    };

    $scope.clearFilter = function (type) {
        if (type === 'func') {
            $scope.$broadcast('funcAreaUpdate', '');
            $scope.selectedFuncArea = {};
        } else if (type === 'report') {
            $scope.$broadcast('reportTypeUpdate', '');
            $scope.selectedReportType = {};
        } else if (type === 'source') {
            $scope.$broadcast('sourceSystemUpdate', '');
            $scope.selectedSourceSystem = {};
        } else if (type === 'auditPersona') {
            $scope.$broadcast('broadcastAuditGroup', '')
            $scope.selectedAuditGroup = {};
        } else if (type === 'reportPersona') {
            $scope.$broadcast('broadcastDeployedReportGroup', $scope.displayType, '');
            $scope.selectedReportGroup = {};
        }
    };

}]).directive('errSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src !== attrs.errSrc) {
                    attrs.$set('src', attrs.errSrc);
                }
            });
        }
    };
});
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.WEBSERVICEURL
 * @description List of All webservices listed here
 * # WEBSERVICEURL
 * Constant in the myBiApp.
 */
angular.module('adminPageApp')
.constant('WEBSERVICEURL', {
    'getUserDetails'        : 'BITool/getUserDetails',//
    'userInfo'              : 'BITool/userinfo/:username',//
    'dashboard'             : 'BITool/dashboard/:username',//
    //this not an ajax call and '/' is not appended from app.js. So appended '/' to work same in www folder also
    'userProfilePic'        : '/BITool/getEmployeeImage/:entityId'
});
'use strict';

/**
 * @ngdoc service
 * @name myBiApp.commonService
 * @description
 * # commonService
 * Service in the myBiApp.
 */
angular.module('adminPageApp')
.service('commonService', ["WEBSERVICEURL", function commonService(WEBSERVICEURL) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    /**
     *prepare the user profile Url
     */
    this.prepareUserProfilePicUrl = function (entityId) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userProfilePic, {'entityId': entityId});
    };

    /**
     *prepare the user Info Url
     */
    this.prepareUserInfoUrl = function (username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.userInfo, {'username': username});
    };


    /**
     *prepare the user Role Details Url
     */
    this.prepareUserRoleDetailsUrl = function (username) {
        return  this.replaceStringWithValues(WEBSERVICEURL.dashboard, {'username': username});
    };


    /**
     *Replace matching object keys in string with its values.
     */
    this.replaceStringWithValues = function (rString, replaceObject) {
        _.map(_.keys(replaceObject), function (key) {
            rString = rString.replace(new RegExp(':' + key, 'g'), replaceObject[key]);
        });
        return rString;
    };
}]);

'use strict';

/**
 * @ngdoc service
 * @name myBiApp.userDetailsService
 * @description
 * # userDetailsService
 * Service in the myBiApp.
 */
angular.module('adminPageApp')
.service('userDetailsService', ["WEBSERVICEURL", "$http", "$q", "commonService", function userDetailsService(WEBSERVICEURL, $http, $q, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var userObject, userPromise = $q.defer();
    $http.get(WEBSERVICEURL.getUserDetails).then(function (resp) {
        userObject = resp.data;
        $http.get(commonService.prepareUserInfoUrl(userObject[0].emcLoginName)).then(function (response) {
            userObject[0].userinfo = response.data;
            userPromise.resolve(userObject);
        });
    }, function () {
        //failed
        userObject = [{"uid": "975409", "userFullName": "Vidyadhar Guttikonda", "emcIdentityType": "V", "title": "Mobile Developer", "mail": "Vidyadhar.Guttikonda@emc.com", "emcCostCenter": "IN1218315", "emcGeography": null, "emcOrgCode": null, "emcOrgName": "IT", "emcEntitlementsCountry": "IN", "emcLoginName": "guttiv", "emctelephoneextension": null, "telephonenumber": "91  7702466463"}];
        userObject[0].userinfo = {"group": [{"groupId": 1, "groupName": "Manufacturing"}], "role": "User", "badge": "Bronze"};
        userPromise.reject(userObject);
    });
    return {
        'userObject': userObject,
        'userPromise': userPromise.promise
    };
}]);

'use strict';

angular.module('adminPageApp').controller('BICommunicationCtrl',["$scope", "userDetailsService", "$http", "$uibModal", "$q", "$timeout", function($scope, userDetailsService, $http, $uibModal, $q, $timeout){
    var groups = []; 
    $scope.myData = {};
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    
    function columnDefs(){
        return[
            {name: 'Options',  width:'10%', cellTemplate: 'views/adminDropdown.html',enableSorting: false},
            {name: 'communicationId',displayName: 'Communications ID', width:'12%', cellTooltip:true}, 
            {name: 'groupName',displayName: 'Persona', width:'12%', cellTooltip:true},
            {name: 'link',displayName: 'Op_Dashboard_Page', width:'24%', cellTooltip:true},
            {name: 'title',displayName: 'Title', width:'15%', cellTooltip:true},
            {name: 'details',displayName: 'Details', width:'10%', cellTooltip:true},
            {name: 'image',displayName: 'Image URL', width:'20%', cellTooltip:true}
        ];
    }
   
    function onRegisterApi (gridApi){
        $scope.gridApi=gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateCommunication);
     };
  
    $scope.myData= {
        enableRowSelection              : true,
        infiniteScrollRowsFromEnd       : 20,
        infiniteScrollUp                : false,
        infiniteScrollDown              : true,
        data                            :[],
        columnDefs                      :columnDefs(),
        onRegisterApi                   :onRegisterApi
    };

    //
    //groups dropdown on leftpanel
//    userDetailsService.userPromise.then(function(userObj){
//        userObj = userObj[0];
//        var url;
//        if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'admin' ) {
//            url = 'BITool/buAdmin/getBUAdminGroup/?userName=';
//        } else if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'buadmin') {
//            url = 'BITool/buAdmin/getBIGroupForBUAdmin/?userName=';
//        }
//        url = url+userObj.emcLoginName;
//        $http.get(url).then(function(resp){
//            $scope.$emit('emitAuditGroup', resp.data);
//        });
//    });

    $scope.$on('broadcastAuditGroup', function(event, communicationGroup){
        if (communicationGroup) {
            $scope.communicationGroup = communicationGroup;
        } else {
            $scope.communicationGroup = '';
        }
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateCommunication();
    });
    //
    
    $scope.deleteItems=function(row){
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function(){
                    row.id = row.communicationId;
                    return{
                        pageType : 'Communication',
                        data: row
                    };
                }
            }
        });
        
        modalInstance.result.then(function(deleteObjID){
            var newArray = $scope.myData.data;
            $scope.messageAlert= "Deleting CommunicationID "+deleteObjID ;
            $scope.messageAlertError='';
            
            $http.delete('BITool/admin/deleteBICommunication/'+deleteObjID)
                .then(function(resp){
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "CommunicationID " +deleteObjID + " deleted successfully";
                        var deleteObj={};
                        for(var i=0; i<$scope.myData.data.length; i++){
                            var eachEle=$scope.myData.data[i];
                            if(eachEle.communicationId===deleteObjID){
                                deleteObj=eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index,1);
                    } else {
                        $scope.messageAlert="";
                        $scope.messageAlertError="Error While Deleting the CommunicationID " + deleteObjID;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                },function(){
                    $scope.messageAlert="";
                    $scope.messageAlertError="Error While Deleting the CommunicationID " + deleteObjID;
                });
        });
    };
 
    $scope.open = function(row){
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/BICommunicationModal.html',
            controller: 'BICommunicationModalInstanceCtrl',
            resolve: {
                items: function(){
                    if(row === undefined){
                        return {'type':'new', groups: groups};
                    }else{
                        return {'type':'edit', groups: groups, data: angular.copy(row)};
                    }
                }
            }
        });
        
        modalInstance.result.then(function (selectedItem){
            if(selectedItem.type && selectedItem.type === 'new'){
                if (selectedItem.file) {
                    var request = {
                        method: 'POST', 
                        url: 'BITool/admin/addCommunicationWithImage',
                        data: selectedItem.data,
                        transformRequest : angular.identity,
                        headers : {
                            'Content-Type' : undefined
                        } 
                    };
                } else {
                    var request = {
                        method: 'POST',
                        url: 'BITool/admin/addCommunicationWithImage',
                        data: selectedItem.data,
                        headers : {
                            'Content-Type' : undefined
                        }
                    };
                }

                $scope.messageAlert = "Saving "+selectedItem.title+"...";
                $scope.messageAlertError='';
                
                $http(request)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert= "Communication " + selectedItem.title + " saved successfully";
                            $scope.myData.data = [];
                            $scope.updateCommunication();
                        } else {
                            $scope.messageAlert ='';
                            $scope.messageAlertError= "Error While Saving the Communication " + selectedItem.title;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    },function(){
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While Saving the Communication " + selectedItem.title;
                    });
            } else {
                $scope.messageAlert= "Updating "+selectedItem.title+"...";
                $scope.messageAlertError='';
                var request = {
                        method: 'POST',
                        url: 'BITool/admin/updateBICommunication',
                        data: selectedItem.data,
                        headers : {
                            'Content-Type' : undefined
                        }
                    };
            
                //var communication = _.omit(selectedItem,'groupName');
                $http(request)
                    .then(function(resp){
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert= "Communication " + selectedItem.title + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateCommunication();
                        } else {
                            $scope.messageAlert ='';
                            $scope.messageAlertError= "Error While updating the Communication " + selectedItem.title;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    },function(){
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While updating the Communication " + selectedItem.title;
                    });
            }
            defer.resolve(selectedItem);
        },function(){
        
        });
        return defer.promise;
    };
 
    $scope.searchTextValue = '';
    var searchPromises = [];
   
    function cancelPendingPromise () {
        _.map(searchPromises, function(eachPromise){
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    $scope.$on('searchCommunication', function(event, searchTxt){
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateCommunication();
    });
 
    $scope.updateCommunication = function(){
        var offset = $scope.myData.data.length+1;
        var promise = $q.defer();
        var canceller = $q.defer();
        $scope.communicationGroup = ($scope.communicationGroup) ? $scope.communicationGroup : '';
        
        var httpPromise = $http({
            'url': 'BITool/admin/communicationSearch/'+offset+'/20?searchText='+$scope.searchTextValue+'&groupid='+$scope.communicationGroup,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function(resp){
            groups = _.sortBy(resp.data.allGroups, 'groupName');
            $scope.$emit('emitAuditGroup', groups);
            
            _.map(resp.data.communicationList,function(eachList){
               //eachList.groupId; 
                _.map(resp.data.allGroups,function(eachGroup){
                    if(eachList.groupId === eachGroup.groupId){
                        eachList.groupName = eachGroup.groupName;
                    }
                });
            });
                
            if($scope.myData.data.length===0){
                $scope.myData.data=resp.data.communicationList;
            }else{
                $scope.myData.data = $scope.myData.data.concat(resp.data.communicationList);
            }

            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false,resp.data && resp.data.communicationList && resp.data.communicationList.length === 20).then(function(){
                promise.resolve();
            });
        });
        
        httpPromise.cancelService = function(){
            canceller.resolve();
        };
        
        searchPromises.push(httpPromise);
        return promise.promise;
    };
        
    $scope.updateCommunication();
    $scope.$watch('messageAlert',function(){
        $timeout(function(){
            $scope.messageAlert= "";
        },5000);
    });

    $scope.$watch('messageAlertError',function(){
        $timeout(function(){
            $scope.messageAlertError= "";
        },5000);
    });
}]);

angular.module('adminPageApp').controller('BICommunicationModalInstanceCtrl',["$scope", "$uibModalInstance", "items", "$timeout", "$http", function($scope,$uibModalInstance,items, $timeout, $http){
    $scope.groups = items.groups;
    $scope.imageMode = 'url';
    $scope.errorFlag = false;
    $scope.imageError = '';
    var imageData = new FormData();
    
    $scope.getTheImageFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            imageData.append('imageFile', value);
        }); 
    };
    
    $scope.validateUpload = function(files) {
        $scope.imageError = '';
        var fileName = files[0].name;
        var size = files[0].size;
        var extension = fileName.split('.');
        extension = extension[extension.length-1];
        
        $scope.$apply(function() {

            if(extension !== 'jpg' && extension !== 'png') {
                changeToDefault('Error : Unsupported file format. Please choose only jpg or png only');
                return;
            }

            if(size > 500000) {
                changeToDefault('Error : File size greater than 500KB. Please select an image less than 500 KB in size');
                return;
            }
            
            var url = 'BITool/admin/imageExistInServer/?imageName='+fileName;
            
            $http.get(url).then(function(response, status, headers){
                if (response.data && response.data.status && response.data.status.toLowerCase() === 'success') {
                    $scope.imageError = '';
                    $scope.errorFlag = true;
                } else {
                    $scope.imageError = response.data.message;
                    $scope.errorFlag = true;
                }
            },function(newArray, status,headers, config){
                $scope.messageAlertError="Error While updating";
            });
        });
    };
    
    $scope.urlValidate = function() {
        var imageUrl = document.getElementById('communicationImageUrl').value;
        if(imageUrl && (imageUrl.indexOf('.png') < 0) && (imageUrl.indexOf('.jpg') < 0 )) {
            $scope.CommunicationForm.communicationImage.$error.url = true;
        }
    }
    
    if(items.type && items.type === 'new') {
        $scope.items = {
            "communicationId":null,
            "link":"",
            "title":"",
            "details":"",
            "image":"",
            "type": 'new',
            "imageFile":""
        };
    }else {
        $scope.items = items.data;
        
        angular.forEach($scope.groups, function(group) {
           if(group.groupId === items.data.groupId) {
               $scope.items.groupName = group.groupName;
           } 
        });
    }

    $scope.close = function() {
        $uibModalInstance.dismiss('close');
    };
    
    $scope.save = function(selectedItem){
        $scope.selectedItem = selectedItem;
        var file = document.getElementById('myFile').files[0];
        
        (selectedItem.title)? imageData.append('title', selectedItem.title) :'';
        (selectedItem.details)? imageData.append('details', selectedItem.details): '';
        imageData.append('link', selectedItem.link);
        
        if(items.type && items.type === 'new'){
            selectedItem.groupIdList = selectedItem.groupIdList.toString();
            selectedItem = _.omit(selectedItem,'type');
            imageData.append('groupIdList', selectedItem.groupIdList);
            imageData.append('communicationId', null);
            
            if(file) {
                imageData.append('image', '');
                $uibModalInstance.close({'type':'new', 'file':true, 'title':selectedItem.title, 'data':imageData});
            } else {
                imageData.append('image', selectedItem.image);
                $uibModalInstance.close({'type':'new', 'file':false, 'title':selectedItem.title, 'data':imageData});
            }
        } else {
            imageData.append('communicationId', selectedItem.communicationId);
            imageData.append('image', selectedItem.image);
            imageData.append('groupId', selectedItem.groupId);
            $uibModalInstance.close({'title':selectedItem.title, 'data':imageData});
        }
    };
    
    function changeToDefault(message) {
        $scope.imageError = message;
        $scope.errorFlag = false;
        var fileInputElement = document.getElementById('myFile');
        fileInputElement.parentNode.replaceChild(
            fileInputElement.cloneNode(true), 
            fileInputElement
        );
    }
}]);
'use strict';

angular.module('adminPageApp').controller('BINewsCtrl',["$scope", "$http", "$uibModal", "$q", "$timeout", function($scope,$http,$uibModal,$q, $timeout){
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.myData={};
    $scope.$emit('resetSearchText');
    $scope.$emit('resetIconFlag', false);
    
    function columnDefs(){
        return[ 
            {name: 'Options', width:'10%',cellTemplate: 'views/adminDropdown.html'},
            {name: 'id', displayName: 'News ID', width: '10%', cellTooltip:true},
            {name: 'title', displayName: 'Title', width: '15%', cellTooltip:true},
            {name: 'description', displayName: 'Description', width: '20%', cellTooltip:true},
            {name: 'url', displayName: 'URL', width: '20%', cellTooltip:true},
            {name: 'createdDate', displayName: 'Created Date', width: '25%', cellTooltip:true}
        ];
    }
    
     function onRegisterApi (gridApi){
                $scope.gridApi=gridApi;
                //infiniteScroll functionality for adding more rows.
                gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateNews);
     };
     
    $scope.myData= {
        enableRowSelection              : true,
        infiniteScrollRowsFromEnd       : 20,
        infiniteScrollUp                : false,
        infiniteScrollDown              : true,
        data                            : [],
        columnDefs                      : columnDefs(),
        onRegisterApi                   : onRegisterApi
    };
    
    
    
    $scope.deleteItems=function(row){
        var modalInstance=$uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function(){
                    
                    return {
                        pageType : 'News',
                        data: row
                    };
                }
            }
        });
        
        modalInstance.result.then(function(deleteObjID){
           
           var newArray=$scope.myData.data;
           
           $scope.messageAlert= "Deleting NewsId "+deleteObjID;
            $scope.messageAlertError='';
           $http.get('BITool/admin/deleteNews/'+deleteObjID)
           .then(function(response, status, headers){
                if (response.data && response.data.status && response.data.status.toLowerCase() === 'success') {
                    $scope.messageAlert = "NewsID " +deleteObjID + " deleted successfully";
                    var deleteObj={};
                    for(var i=0; i<$scope.myData.data.length; i++){
                        var eachEle=$scope.myData.data[i];
                        if(eachEle.id===deleteObjID){
                            deleteObj=eachEle;
                        }
                    }
    
                    var index = $scope.myData.data.indexOf(deleteObj);
                    $scope.myData.data.splice(index,1);
                } else {
                    $scope.messageAlert= "";
                    $scope.messageAlertError="Error While Deleting the NewsId " + deleteObjID;
                    if (response.data && response.data.message) {
                        $scope.messageAlertError = $scope.messageAlertError + ', ' + response.data.message
                    }
                }
           },function(newArray, status,headers, config){
                $scope.messageAlert= "";
                $scope.messageAlertError="Error While Deleting the NewsId " + deleteObjID;
               
           });
        });
        
    };
    
    
    $scope.open=function(row){
        var defer=$q.defer();
        var modalInstance=$uibModal.open({
           templateUrl: 'views/BINewsModal.html',
           controller: 'BINewsModalInstanceCtrl',
           resolve: {
               items: function(){
                   if(row === undefined) {
                       return {'type':'new'};
                   } else {
                       return angular.copy(row);
                   }
                   
               }
           }
        });
        modalInstance.result.then(function(updateNewsObj){
            
            if(updateNewsObj.type && updateNewsObj.type === 'new') {
                var postObj = _.omit(updateNewsObj,'type');
                $scope.messageAlert= "Saving "+updateNewsObj.title+"...";
                $scope.messageAlertError='';
                $http.post('BITool/admin/addNews',postObj).then(function(resp){
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert= "News " + updateNewsObj.title + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateNews();
                    } else {
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While Saving the News " + updateNewsObj.title;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                    
                },function(){
                   $scope.messageAlert ='';
                   $scope.messageAlertError= "Error While Saving the News " + updateNewsObj.title;
                });
                
            } else {
                updateNewsObj.id=parseInt(updateNewsObj.id);
                $scope.messageAlert= "Updating "+updateNewsObj.title+"...";
                $scope.messageAlertError='';
                $http.post('BITool/admin/updateNews',updateNewsObj)
                .then(function(updatedNews, status, headers){
                    if (updatedNews.data && updatedNews.data.status && updatedNews.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert= "News " + updateNewsObj.title + " updated successfully";
                        $scope.myData.data = [];
                        $scope.updateNews();
                    } else {
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While updating the News " + updateNewsObj.title;
                        if (updatedNews.data && updatedNews.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + updatedNews.data.message
                        }
                    }
                },function(updatedNews, status, headers, config){
                        $scope.messageAlert ='';
                        $scope.messageAlertError= "Error While updating the News " + updateNewsObj.title;
                });
                
            }
            defer.resolve(updateNewsObj);
        },function(){
            
        });
        return defer.promise;
   };
   $scope.searchTextValue = '';
   var searchPromises = [];
   
   function cancelPendingPromise () {
                _.map(searchPromises, function(eachPromise){
                        eachPromise.cancelService();
                });
                searchPromises = [];
    }
   
   $scope.$on('searchNews', function(event, searchTxt){
             $scope.searchTextValue = searchTxt;
             cancelPendingPromise();
             $scope.myData.data = [];
             $scope.updateNews();
        });
   
    $scope.updateNews=function(){
        var offset = $scope.myData.data.length+1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var httpPromise = $http({
            'url': 'BITool/admin/newsSearch/'+offset+'/20?searchText='+$scope.searchTextValue,
            'method': 'get',
            'timeout': canceller.promise
          }).then(function(resp){
                    
                    if($scope.myData.data.length===0){
                        $scope.myData.data=resp.data;
                    }else{
                        $scope.myData.data = $scope.myData.data.concat(resp.data);
                    }
                    $scope.gridApi.infiniteScroll.saveScrollPercentage();
                    $scope.gridApi.infiniteScroll.dataLoaded(false,resp.data && resp.data.length === 20).then(function(){
                        promise.resolve();
                    });
        });
        httpPromise.cancelService = function(){
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };
    
    $scope.updateNews();
    
    $scope.$watch('messageAlert',function(){
        $timeout(function(){
            $scope.messageAlert= "";
        },5000);
    });
    
    $scope.$watch('messageAlertError',function(){
        $timeout(function(){
            $scope.messageAlertError= "";
        },5000);
    });
    
}]);

angular.module('adminPageApp').controller('BINewsModalInstanceCtrl',["$scope", "$uibModalInstance", "items", "$http", function($scope,$uibModalInstance,items, $http){
    if(items.type && items.type === 'new' ) {
        $scope.items = {
            "id":null,
            "createdDate":null,
            "description":"",
            "title":"",
            "url":"",
            "type": 'new'
            };
    } else {
        $scope.items = items;
    }
    $scope.cancel=function(){
        $uibModalInstance.dismiss('cancel');
    };
    
   
    $scope.save=function(updateNewsObj){
        
        $scope.updateNewsObj = updateNewsObj;
       
        $uibModalInstance.close(updateNewsObj);
        
        
    };
}]);


'use strict';

angular.module('adminPageApp').controller('deleteModalCtrl',["$scope", "items", "$uibModalInstance", function($scope,items,$uibModalInstance){
    $scope.items=items;
    $scope.message = '';
    
    if($scope.items.pageType==='News'){
        $scope.message = 'Are you sure to delete NewsID ' + $scope.items.data.id + ' from Insights';
    } else if($scope.items.pageType==='Communication'){
        $scope.message = 'Are you sure to delete CommunicationID ' + $scope.items.data.communicationId + ' from Insights';
    } else if($scope.items.pageType === 'Groups'){
        $scope.message = 'Are you sure to delete PersonaID ' + $scope.items.data.groupId + ' from Insights';
    } else if($scope.items.pageType === 'Levels'){
        $scope.message = 'Are you sure to delete LevelID ' + $scope.items.data.levelId + ' from Insights';
    } else if($scope.items.pageType === 'Users'){
        $scope.message = 'Are you sure to delete UserName ' + $scope.items.data.userName + ' from Insights';
    } else if($scope.items.pageType === 'Notification'){
        $scope.message = 'Are you sure to delete Notification ' + $scope.items.data.notificationId + ' from Insights';
    }
    
    
    $scope.delete=function(deleteObj){
        $uibModalInstance.close(deleteObj);
    };
    
    $scope.cancel = function(){
      $uibModalInstance.dismiss('cancel');  
    };
    
    
    
    
}]);


'use strict';

angular.module('adminPageApp').controller('GroupCtrl',["$scope", "$http", "$uibModal", "$q", "$timeout", function($scope, $http, $uibModal, $q, $timeout){
    $scope.myData = {};
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetIconFlag', false);
    
    $scope.$on('userObjectBroadCast', function(userObject) {
        $scope.userObject = userObject;
    });
    
    function columnDefs(){
        return[
            {name: 'Options', width:'8%', cellTemplate: 'views/adminDropdown.html',enableSorting: false},
            {name: 'groupId',displayName: 'Persona ID', width:'7%', cellTooltip: true },
            {name: 'groupName', displayName: 'Persona Name', width:'15%', cellTooltip: true},
            {name: 'operationDashboardPage', displayName:'Op_Dashboard_Page', width:'20%',cellTooltip: true},
            {name: 'helpLinkLabel', displayName: 'Help Link Label', width:'15%', cellTooltip: true},
            {name: 'pageLink', displayName: 'Help Link', width:'20%', cellTooltip: true},
            {name: 'buGroupName', displayName: 'Business Unit', width:'15%', cellTooltip: true}
        ];
    }
    
    function onRegisterApi(gridApi){
        $scope.gridApi=gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateGroup);
    };
    
    $scope.myData = {
      enableRowSelection            :true,
      infiniteScrollRowsFromEnd     : 20,
      infiniteScrollUp              : false,
      infiniteScrollDown            : true,
      data                          :[],
      columnDefs                    :columnDefs(),
      onRegisterApi                   : onRegisterApi
    };
    
    $scope.deleteItems = function(row){
        row.id=row.groupId;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function(){
                    return{
                        pageType: 'Groups',
                        data: row
                    };
                }
            }
        });
        modalInstance.result.then(function(deleteObjID){
            var newArray = $scope.myData.data;
            $scope.messageAlert= "Deleting PersonaID "+deleteObjID;
            $scope.messageAlertError='';
            $http.delete('BITool/admin/deleteBIGroup/'+deleteObjID)
                .then(function(resp){
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {        
                        $scope.messageAlert = "PersonaID " +deleteObjID + "deleted successfully";
                        var deleteObj={};
                        for(var i=0;i<$scope.myData.data.length; i++){
                            var eachEle = $scope.myData.data[i];
                            if(eachEle.groupId === deleteObjID){
                                deleteObj = eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index,1);
                    } else {
                        $scope.messageAlert="";
                        $scope.messageAlertError="Error While Deleting the PersonaID " + deleteObjID;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                },function(){
                    $scope.messageAlert="";
                    $scope.messageAlertError="Error While Deleting the PersonaID " + deleteObjID;
                });
            });
    };
    
    $scope.searchTextValue = '';
    var searchPromises = [];
    
    function cancelPendingPromise () {
        _.map(searchPromises, function(eachPromise){
                eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    $scope.$on('searchGroup', function(event, searchTxt){
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = []; 
        $scope.updateGroup();
    });
    
    $scope.updateGroup = function(){
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var httpPromise = $http({
            'url': 'BITool/admin/groupSearch/' + offset + '/20?searchText=' + $scope.searchTextValue,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data);
            }
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function () {
                promise.resolve();
            });
        });
        httpPromise.cancelService = function () {
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };
    $scope.updateGroup();

    $scope.$watch('messageAlert', function () {
        $timeout(function () {
            $scope.messageAlert = "";
        }, 5000);
    });

    $scope.$watch('messageAlertError', function () {
        $timeout(function () {
            $scope.messageAlertError = "";
        }, 5000);
    });


    $scope.open = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/GroupsModal.html',
            controller: 'GroupModalInstanceCtrl',
            resolve: {
                items: function () {
                    if (row === undefined) {
                        return {'type': 'new'};
                    } else {
                        return angular.copy(row);
                    }
                }
            }
        });
        modalInstance.result.then(function (updateGroupObj) {
            if (updateGroupObj.type && updateGroupObj.type === 'new') {
                var postObj = _.omit(updateGroupObj, 'type');
                $scope.messageAlert = "Saving " + updateGroupObj.groupName + "...";
                $scope.messageAlertError = '';
                $http.post('BITool/admin/addBIGroup', postObj).then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Persona " + updateGroupObj.groupName + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateGroup();
                    } else {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Saving the Persona " + updateGroupObj.groupName;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While Saving the Persona " + updateGroupObj.groupName;
                });
            } else {
                $scope.messageAlert = "Updating " + updateGroupObj.groupName + "...";
                $scope.messageAlertError = '';
                $http.post('BITool/admin/updateBIGroup', updateGroupObj)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "Persona " + updateGroupObj.groupName + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateGroup();
                        } else {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While updating the Persona " + updateGroupObj.groupName;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                            }
                        }
                    }, function () {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While updating the Persona " + updateGroupObj.groupName;
                    });
            }
            defer.resolve(updateGroupObj);
        }, function () {

        });
        return defer.promise;
    };
}]);

angular.module('adminPageApp').controller('GroupModalInstanceCtrl',["$scope", "$http", "$uibModalInstance", "items", function($scope, $http, $uibModalInstance, items){
    if(items.type && items.type === 'new'){
        $scope.items = {
            "groupName" : "",
            "operationDashboardPage" : "",
            "helpLinkLabel" : "",
            "pageLink" : "",
            "type" : 'new',
            "buGroupId" : ""
        };
    } else {
        $scope.items = items;
    }
    
    $http.get('BITool/admin/getBUGroup').then(function(response) {
        $scope.buGroupObj = response.data;
    });
    
    $scope.close=function(){
        $uibModalInstance.dismiss('cancel');
    };
    
    $scope.save = function(selectedItem){
        selectedItem = _.omit(selectedItem,'buGroupName');
        $scope.selectedItem = selectedItem;
        $uibModalInstance.close(selectedItem);
    };
}]);
'use strict';

angular.module('adminPageApp').controller('LevelCtrl', ["$scope", "$http", "$uibModal", "$q", "$timeout", "userDetailsService", function ($scope, $http, $uibModal, $q, $timeout, userDetailsService) {
    $scope.myData = {};
    $scope.messageAlert = "";
    $scope.messageAlertError = '';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    var groupIdList = [];
    $scope.searchTextValue = '';
    $scope.personaId = '';
    var searchPromises = [];
    
    function columnDefs() {
        return[
            {name: 'Options', width: '10%', cellTemplate: 'views/adminDropdown.html', enableSorting: false},
            {name: 'levelId', displayName: 'Level Id', width: '10%', cellTooltip: true},
            {name: 'levelDesc', displayName: 'Level Name', width: '15%', cellTooltip: true},
            {name: 'levelNumber', displayName: 'Level Number', width: '15%', cellTooltip: true},
            {name: 'parentLevelName', displayName: 'Parent Name', width: '35%', cellTooltip: true},
            {name: 'parentLevelId', displayName: 'Parent id', width: '25%', cellTooltip: true}
        ];
    }

    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateLevel);
    }

    $scope.myData = {
        enableRowSelection: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };

    $scope.deleteItems = function (row) {
        row.id = row.levelId;
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function () {
                    return{
                        pageType: 'Levels',
                        data: row
                    };
                }
            }
        });
        
        modalInstance.result.then(function (deleteObjID) {
            var newArray = $scope.myData.data;
            $scope.messageAlert = "Deleting LevelID " + deleteObjID;
            $scope.messageAlertError = '';
            $http.delete('BITool/admin/deleteBILevel/' + deleteObjID)
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "LevelID " + deleteObjID + "deleted successfully";
                        var deleteObj = {};
                        for (var i = 0; i < $scope.myData.data.length; i++) {
                            var eachEle = $scope.myData.data[i];
                            if (eachEle.levelId === deleteObjID) {
                                deleteObj = eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index, 1);
                    } else {
                        $scope.messageAlert = "";
                        $scope.messageAlertError = "Error While Deleting the LevelID " + deleteObjID;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + response.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = "";
                    $scope.messageAlertError = "Error While Deleting the LevelID " + deleteObjID;
                });
        });
    };

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }

    $scope.$on('searchLevel', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateLevel();
    });
    
    $scope.$on('broadcastAuditGroup', function(event, personaId){
        (personaId) ? $scope.personaId = personaId : $scope.personaId = '';
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateLevel();
    });
    
    $scope.updateLevel = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var url ='';
        
        if($scope.personaId) {
            url = 'BITool/admin/levelSearch/' + offset + '/20?searchText=' + $scope.searchTextValue + '&personaId='+ $scope.personaId;
        } else {
            url = 'BITool/admin/levelSearch/' + offset + '/20?searchText=' + $scope.searchTextValue + '&personaId=';
        }
        console.log(url);
        var httpPromise = $http({
            'url': url,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
//            levels = resp.data.allLevels;
            groupIdList = _.sortBy(resp.data.allGroups, 'groupName');
            $scope.$emit('emitAuditGroup', groupIdList);
            var newUrl = 'BITool/admin/getParentOrChildLevel?levelId=';
            
//            $http.get(newUrl).then(function(resp){
//                parentLevelList = resp.data;
//            });
            
//            _.map(resp.data.levelList, function (eachList) {
//                //eachList.groupId; 
//                _.map(resp.data.allLevels, function (eachLevel) {
//                    if (eachList.parentLevelId === eachLevel.levelId) {
//                        eachList.parentLevelDesc = eachLevel.levelDesc;
//                    }
//                });
//            });

            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data.levelList;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data.levelList);
            }
            
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.levelList && resp.data.levelList.length === 20).then(function () {
                promise.resolve();
            });
        });
        httpPromise.cancelService = function () {
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };
    
    $scope.updateLevel();
    
    $scope.$watch('messageAlert', function () {
        $timeout(function () {
            $scope.messageAlert = "";
        }, 5000);
    });

    $scope.$watch('messageAlertError', function () {
        $timeout(function () {
            $scope.messageAlertError = "";
        }, 5000);
    });

    $scope.open = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/LevelModal.html',
            controller: 'LevelModalInstanceCtrl',
            resolve: {
                items: function () {
                    if (row === undefined) {
                        return {'type': 'new', groupIdList : groupIdList};
                    } else {
                        return {'type': 'edit', groupIdList : groupIdList, data: angular.copy(row)};
                    }
                }
            }
        });
        
        modalInstance.result.then(function (updateLevelObj) {
            if (updateLevelObj.type && updateLevelObj.type === 'new') {
                var postObj = _.omit(updateLevelObj, 'type');
                $scope.messageAlert = "Saving " + updateLevelObj.levelDesc + "...";
                $scope.messageAlertError = '';
                $http.post('BITool/admin/addBILevel', postObj).then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Level " + updateLevelObj.levelDesc + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateLevel();
                    } else {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Saving the Level " + updateLevelObj.levelDesc;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While Saving the Level " + updateLevelObj.levelDesc;
                });
            } else {
                $scope.messageAlert = "Updating " + updateLevelObj.levelDesc + "...";
                $scope.messageAlertError = '';
                var postObj = _.omit(updateLevelObj, 'parentLevelDesc');
                $http.post('BITool/admin/updateBILevel', postObj)
                        .then(function (resp) {
                            if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                                $scope.messageAlert = "Level " + updateLevelObj.levelDesc + " updated successfully";
                                $scope.myData.data = [];
                                $scope.updateLevel();
                            } else {
                                $scope.messageAlert = '';
                                $scope.messageAlertError = "Error While updating the Level " + updateLevelObj.levelDesc;
                                if (resp.data && resp.data.message) {
                                    $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                                }
                            }
                        }, function () {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While updating the Level " + updateLevelObj.levelDesc;
                        });
            }
            defer.resolve(updateLevelObj);
        }, function () {
        });
        
        return defer.promise;
    };
}]);

angular.module('adminPageApp').controller('LevelModalInstanceCtrl', ["$scope", "$uibModalInstance", "items", "$http", "$rootScope", "$timeout", function ($scope, $uibModalInstance, items, $http, $rootScope, $timeout) {
    $scope.levelFlag = 'Parent';
    $scope.childLevelList = [];
    $scope.listReady = false;
    
    if (items.type && items.type === 'new') {
        $scope.items = {
            "levelDesc": "",
            "levelId": null,
            "parentLevelId": "",
            "childLevelId": "",
            "groupIds":"",
            "type": 'new'
        };
        
        $scope.groupIdList = items.groupIdList;

    } else {
        var url = 'BITool/admin/getBILevelForEdit?levelId='+items.data.levelId;

        $http.get(url).then(function(resp) {
            $scope.items = resp.data;
            (resp.data.groupIds) ? $scope.selectedGroupIds = getSelectedGIds(resp.data.groupIds) : '';
            $scope.groupIdList = resp.data.allGroups;
            $scope.levelFlag = ($scope.items.parentLevelList && $scope.items.parentLevelList.length > 0)? 'Child' :'Parent'; 
            $scope.parentLevelList = $scope.items.parentLevelList;
            $scope.childLevelList = $scope.items.childLevelList;
        });
    }
    
    function getSelectedGIds (gIds) {
        gIds = gIds.split(',');
        var preList = []
        for(var i = 0; i < gIds.length; i++ ){
            preList.push({'id':gIds[i]});
        }
        return preList;
    }
    
    $scope.selectLevelType = function(type) {
        $scope.levelFlag = type;
        
        if(type === 'Child') {
            if(!$scope.parentLevelList) {
                var url = 'BITool/admin/getParentOrChildLevel?levelId=';
                $http.get(url).then(function(resp){
                    $scope.parentLevelList = resp.data;
                });
            }
        }    
    };
    
    $scope.getChildLevels = function() {
        var url = 'BITool/admin/getParentOrChildLevel?levelId='+$scope.items.parentLevelId;
        
        $http.get(url).then(function(resp){
            $scope.childLevelList = resp.data;
        });
    };
    
    $scope.close = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.save = function (selectedItem) {
        if(selectedItem.type==='new') {
            if($scope.levelFlag === 'Parent') {
                selectedItem.parentLevelId = null;
                selectedItem.childLevelId = null;
            }
            
            selectedItem.groupIds = selectedItem.selectedGroupIdList.toString();
            selectedItem = _.omit(selectedItem,'groupIdList');
            selectedItem = _.omit(selectedItem,'selectedGroupIdList');
            $scope.selectedItem = selectedItem;
            console.log($scope.selectedItem);
            $uibModalInstance.close(selectedItem);
        } else {
            if($scope.levelFlag === 'Parent') {
                selectedItem.parentLevelId = null;
                selectedItem.childLevelId = null;
            }
            selectedItem.deletedGroupIds = getDeletedGroupIds(selectedItem.groupIds, selectedItem.selectedGroupIdList).toString();
            selectedItem.groupIds = selectedItem.selectedGroupIdList.toString();
            selectedItem = _.omit(selectedItem,'allGroups');
            selectedItem = _.omit(selectedItem,'childLevelList');
            selectedItem = _.omit(selectedItem,'createdBy');
            selectedItem = _.omit(selectedItem,'createdDate');
            selectedItem = _.omit(selectedItem,'groupNames');
            selectedItem = _.omit(selectedItem,'levelNumber');
            selectedItem = _.omit(selectedItem,'parentLevelList');
            selectedItem = _.omit(selectedItem,'parentLevelName');
            selectedItem = _.omit(selectedItem,'rowCount');
            selectedItem = _.omit(selectedItem,'selectedGroupIdList');
            selectedItem = _.omit(selectedItem,'updatedBy');
            selectedItem = _.omit(selectedItem,'updatedDate');
            $scope.selectedItem = selectedItem;
            console.log($scope.selectedItem);
            $uibModalInstance.close(selectedItem);
        }
    };
    
    function getDeletedGroupIds(initialList, currentList) {
        var oldList = [];
        var finalList = [];
        if(initialList) {
            initialList = initialList.split(',');
            for(var i =0; i < initialList.length; i++) {
                oldList.push(parseInt(initialList[i], 10));
            }
        } else {
            oldList = [];
        }
        
        if(currentList && currentList.length ) {
            for(var i =0; i < currentList.length; i++) {
                finalList.push(parseInt(currentList[i], 10));
            }
        } else {
            finalList = [];
        }
        
        return _.difference(oldList, finalList);
    }
}]);
'use strict';

angular.module('adminPageApp').controller('UsersCtrl', ["$scope", "$q", "$uibModal", "$http", "$timeout", "userDetailsService", function ($scope, $q, $uibModal, $http, $timeout, userDetailsService) {
    var groups = [], roles = [];
    $scope.myData = {};
    $scope.messageAlert = "";
    $scope.messageAlertError = '';
    $scope.personaId= '';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    
    function columnDefs() {
        return [
            {name: 'Options', width: '10%', cellTemplate: 'views/adminDropdown.html'},
            {name: 'fullName', displayName: 'Display Name', width: '20%', cellToolTip: true/*, cellTemplate:"<span>{{row.entity.lastName}}<span ng-show='row.entity.lastName && row.entity.firstName'>,</span> {{row.entity.firstName}}</span>"*/},
            {name: 'userName', displayName: 'Username', width: '25%', cellToolTip: true},
            {name: 'role', displayName: 'Role', width: '15%', cellToolTip: true},
            {name: 'groupName', displayName: 'Persona', width: '20%', cellToolTip: true},
            {name: 'isMultiplePersona', displayName: 'Multiple Persona', width: '10%', cellToolTip: true}
        ];
    }

    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateUsers);
    };

    $scope.myData = {
        enableRowSelection: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };

    //groups dropdown on leftpanel
//    userDetailsService.userPromise.then(function(userObj){
//        userObj = userObj[0];
//        var url;
//        if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'admin' ) {
//            url = 'BITool/buAdmin/getBUAdminGroup/?userName=';
//        } else if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'buadmin') {
//            url = 'BITool/buAdmin/getBIGroupForBUAdmin/?userName=';
//        }
//        url = url+userObj.emcLoginName;
//        $http.get(url).then(function(resp){
//            $scope.$emit('emitAuditGroup', resp.data);
//        });
//    });
    
    $scope.$on('broadcastAuditGroup', function(event, personaId){
//        if (personaId) {
//            $scope.personaId = personaId;
//        } else {
//            $scope.personaId = '';
//        }
        (personaId) ? $scope.personaId = personaId : $scope.personaId = ''; 
        cancelPendingPromise();
        $scope.myData.data = [];
        
        ($scope.searchTextValue)? $scope.searchTextValue : $scope.searchTextValue = '';
        $scope.downloadLink = '/BITool/admin/downloadUserReport?searchText=' + $scope.searchTextValue  + '&personaId=' + $scope.personaId;
        
        $scope.updateUsers();
    });

    $scope.checkRole = function (row) {
        return !(row.role && row.role.toLowerCase() === 'buadmin');
    };

    $scope.checkRoleForOption = function (row) {
        if ($scope.userDetails && $scope.userDetails.emcLoginName) {
            return (row.role && (row.role.toLowerCase() === 'admin' || row.role.toLowerCase() === 'buadmin') && $scope.userDetails.emcLoginName.toLowerCase() !== row.userName.toLowerCase());
        } else {
            return (row.role && (row.role.toLowerCase() === 'admin' || row.role.toLowerCase() === 'buadmin'));
        }
    };

    $scope.updateMemberShip = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/updateMemberShip.html',
            controller: 'UpdateMemberShipCtrl',
            resolve: {
                items: function () {
                    return row;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.messageAlert = "Saving " + selectedItem.userName + "...";
            $scope.messageAlertError = '';
            //{'groupids':$scope.selected,'userid':items.userId, 'userName' : $scope.userName }
            var postObj = {'userId': selectedItem.userid, 'groupIdList': selectedItem.groupids.toString(), 'deletedGroupIdList': selectedItem.deletedGroupIdList.toString()};

            $http.put('BITool/buAdmin/saveOrUpdateBUAdminGroup', postObj)
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "User " + selectedItem.userName + " updated successfully";
                        $scope.myData.data = [];
                        $scope.updateUsers();
                    } else {
                        $scope.messageAlert = '';
//                        $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = resp.data.message
                        }
                    }
                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                });

            defer.resolve(selectedItem);
        }, function () {
        });
        
        return defer.promise;
    };

    $scope.deleteItems = function (row) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function () {
                    row.id = row.userName;
                    return{
                        pageType: 'Users',
                        data: row
                    };
                }
            }
        });

        modalInstance.result.then(function (deleteObjID) {
            var newArray = $scope.myData.data;
            $scope.messageAlert = "Deleting UserID " + deleteObjID;
            $scope.messageAlertError = '';
            $http.delete('BITool/admin/deleteBIUser/' + deleteObjID)
                .then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "UserID " + deleteObjID + "deleted successfully";
                        var deleteObj = {};
                        for (var i = 0; i < $scope.myData.data.length; i++) {
                            var eachEle = $scope.myData.data[i];
                            if (eachEle.userName === deleteObjID) {
                                deleteObj = eachEle;
                            }
                        }
                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index, 1);
                    } else {
                        $scope.messageAlert = "";
//                        $scope.messageAlertError = "Error While Deleting";
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = resp.data.message;
                        }
                    }
                }, function () {
                    $scope.messageAlert = "";
                    $scope.messageAlertError = "Error While Deleting the User " + deleteObjID;
                });
        });
    };

    $scope.open = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/AddUserModal.html',
            controller: 'UsersModalInstanceCtrl',
            resolve: {
                items: function () {
                    if (row === undefined) {
                        var defer = $q.defer(),
                        returnObj = {'type': 'new', 'roles': roles, 'groups': groups};

                        userDetailsService.userPromise.then(function (userObj) {
                            userObj = userObj[0];
                            if (userObj && userObj.userinfo && userObj.userinfo.role && userObj.userinfo.role.toLowerCase() === 'buadmin') {
                                returnObj.userRole = 'buadmin';
                            }
                            defer.resolve(returnObj);
                        });

                        return defer.promise;
                    } else {
                        var defer = $q.defer(),
                        returnObj = {'type': 'edit', 'data': angular.copy(row), 'roles': roles, 'groups': groups};

                        userDetailsService.userPromise.then(function (userObj) {
                            returnObj.user = userObj[0];
                            defer.resolve(returnObj);
                        });

                        return defer.promise;
                    }
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {

            if (selectedItem.type && selectedItem.type === 'new') {
                if (selectedItem.file) {
                    var request = {
                        method: 'POST',
                        url: 'BITool/admin/addBIUser/csv',
                        data: selectedItem.formdata,
                        headers: {
                            'Content-Type': undefined
                        }
                    };
                    $scope.messageAlert = "Saving " + selectedItem.userName + "...";
                    $scope.messageAlertError = '';
                    // SEND THE FILES.
                    $http(request)
                        .then(function (resp) {
                            if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                                $scope.messageAlert = "User/Users added successfully";
                                $scope.myData.data = [];
                                $scope.updateUsers();
                            } else {
                                $scope.messageAlert = '';
//                                $scope.messageAlertError = "Error While Adding";
                                if (resp.data && resp.data.message) {
                                    $scope.messageAlertError = resp.data.message;
                                }
                            }
                        }, function () {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While Adding";
                        });
                } else {
                    var postObj = _.omit(selectedItem, 'type');
                    postObj = _.omit(postObj, 'userRole');
                    $scope.messageAlert = "Saving " + selectedItem.userName + "...";
                    $scope.messageAlertError = '';
                    $http.post('BITool/admin/addBIUser', postObj).then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "User " + selectedItem.userName + " saved successfully";
                            $scope.myData.data = [];
                            $scope.updateUsers();
                        } else {
                            $scope.messageAlert = '';
//                            $scope.messageAlertError = "Error While Adding";
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = resp.data.message
                            }
                        }
                    }, function () {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Adding";
                    });
                }

            } else {
                $scope.messageAlert = "Saving " + selectedItem.userName + "...";
                $scope.messageAlertError = '';
                //selectedItem.groupName = null;
                var postObj = _.omit(selectedItem, '$$hashKey');
                postObj = _.omit(postObj, 'firstName');
                postObj = _.omit(postObj, 'lastName');
                postObj = _.omit(postObj, 'login');
                postObj = _.omit(postObj, 'userId');
                postObj = _.omit(postObj, 'id');
                postObj = _.omit(postObj, 'isMultiplePersona');
                
                $http.post('BITool/admin/updateBIUser', postObj)
                    .then(function (resp) {
                        if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "User " + selectedItem.userName + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateUsers();
                        } else {
                            $scope.messageAlert = '';
//                            $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                            if (resp.data && resp.data.message) {
                                $scope.messageAlertError = resp.data.message
                            }
                        }
                    }, function () {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While updating the User " + selectedItem.userName;
                    });
            }
            
            defer.resolve(selectedItem);
        }, function () {

        });
        return defer.promise;
    };

    //Continue the code for update and new when the webservices are provided
    $scope.searchTextValue = '';
    var searchPromises = [];

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }

    $scope.$on('searchUsers', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        
        ($scope.personaId)? $scope.personaId: $scope.personaId = '';
        $scope.downloadLink = '/BITool/admin/downloadUserReport?searchText=' + $scope.searchTextValue + '&personaId=' + $scope.personaId;
        
        $scope.updateUsers();
    });
    
    ($scope.searchTextValue) ? $scope.searchTextValue : $scope.searchTextValue = '';
    ($scope.personaId) ? $scope.personaId: $scope.personaId = '';
    $scope.downloadLink = '/BITool/admin/downloadUserReport?searchText=' + $scope.searchTextValue + '&personaId=' + $scope.personaId;
    
    $scope.updateUsers = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var url = ($scope.personaId) ? 'BITool/admin/userSearch/' + offset + '/20?searchText=' + $scope.searchTextValue +'&personaId='+$scope.personaId : 'BITool/admin/userSearch/' + offset + '/20?searchText=' + $scope.searchTextValue;
        
        var httpPromise = $http({
            'url': url,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
            userDetailsService.userPromise.then(function (userObj) {
                $scope.userDetails = userObj[0];
            });
            groups = resp.data.allGroups;
            roles = resp.data.allRoles;
            $scope.$emit('emitAuditGroup', groups);
            _.map(resp.data.users,function(eachList){
                if(eachList.isMultiplePersona ===false){
                    eachList.isMultiplePersona = 'No';
                } else {
                    eachList.isMultiplePersona = 'Yes';
                }
                //eachList.groupId;
                _.map(resp.data.allGroups,function(eachGroup){
                    if(eachList.groupId === eachGroup.groupId){
                        eachList.groupName = eachGroup.groupName;
                    }
                });
            });
            
            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data.users;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data.users);
            }
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.users && resp.data.users.length === 20).then(function () {
                promise.resolve();
            });
        });
        httpPromise.cancelService = function () {
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };

    $scope.updateUsers();

    $scope.$watch('messageAlert', function () {
        $timeout(function () {
            $scope.messageAlert = "";
        }, 5000);
    });
//end    
}]);

angular.module('adminPageApp').controller('UsersModalInstanceCtrl', ["$scope", "$uibModalInstance", "items", "$uibModal", function ($scope, $uibModalInstance, items, $uibModal) {
    $scope.activeDirectoryButton = false;
    $scope.importFromCSV = false;
    $scope.modalTitle = 'Add New User';
    $scope.roles = items.roles;
    $scope.groups = items.groups;

    if (items.type && items.type === 'new') {

        $scope.items = {
            "userName": "",
            "role": "User",
            "groupId": 0,
            "type": 'new'
        };
    } else {
        $scope.items = items.data;
        $scope.userDetails = items.user;
        $scope.buFlag = false;

        if (($scope.items.userName.toLowerCase() === $scope.userDetails.emcLoginName.toLowerCase()) && ($scope.items.role !== 'Admin')) {
            $scope.buFlag = true;
        }
    }

    if (items && items.userRole && items.userRole === 'buadmin') {
        $scope.activeDirectoryButton = true;
        $scope.modalTitle = 'Add Users from Active Directory';
        $scope.items.userRole = items.userRole;
    }

    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };

    /**
     * Used for uploading files
     * reference: http://www.encodedna.com/angularjs/tutorial/angularjs-file-upload-using-http-post-formdata-webapi.htm
     */
    var formdata = new FormData();

    $scope.getTheFiles = function ($files) {
        angular.forEach($files, function (value, key) {
            formdata.append('file', value);
        });
    };

    /**
     * End of uploading files logic
     */

    $scope.save = function (selectedItem) {
        if ($scope.items.type && $scope.activeDirectoryButton && selectedItem) {
            $scope.selectedItem = selectedItem;
            $uibModalInstance.close(selectedItem);
        } else if ($scope.importFromCSV) {
            $uibModalInstance.close({'type': 'new', 'formdata': formdata, 'file': true});
        } else if (selectedItem) {
            _.map($scope.groups, function (eachGrp) {
                if (eachGrp.groupName === selectedItem.groupName) {
                    selectedItem.groupId = eachGrp.groupId;
                }
            });
            $scope.selectedItem = selectedItem;
            $uibModalInstance.close(selectedItem);
        }
    };

    $scope.importUser = function () {
        $scope.importFromCSV = true;
        $scope.modalTitle = 'Import Users from file';
    };

    $scope.addUserFromActiveDirectory = function () {
        $scope.activeDirectoryButton = true;
        $scope.modalTitle = 'Add Users from Active Directory';
    };

    $scope.checkSaveConditions = function () {
        if ($scope.items.type && $scope.activeDirectoryButton && !($scope.items.userName && $scope.items.groupId)) {
            return true;
        } else if (!($scope.items.userName)) {
            return true;
        }
        return false;
    };
}]);

angular.module('adminPageApp').controller('UpdateMemberShipCtrl', ["$scope", "$uibModalInstance", "items", "$http", "$q", function ($scope, $uibModalInstance, items, $http, $q) {

    $scope.groupsArray = [];
    $scope.selected = [];
    $scope.groupIdList = [];
    $scope.deletedIdList = [];
    $scope.userName = (items.fullName) ? items.fullName : items.userName;

    $q.all([$http.get('BITool/buAdmin/getBUAdminGroup/?userName=' + items.userName), $http.get('BITool/buAdmin/getBIGroupForBUAdmin/?userName=' + items.userName)]).then(function (resp) {
        $scope.groupsArray = resp[0].data;
        _.map(resp[1].data, function (group) {
            $scope.selected.push(group.groupId);
        });

    });

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
            $scope.deletedIdList.push(item);
        }
        else {
            list.push(item);
            var idx1 = $scope.deletedIdList.indexOf(item);
            (idx1 > -1) ? $scope.deletedIdList.splice(idx1, 1) : $scope.deletedIdList;
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.close = function () {
        $uibModalInstance.dismiss('close');
    };

    $scope.save = function () {
        $uibModalInstance.close({'groupids': $scope.selected, 'deletedGroupIdList': $scope.deletedIdList, 'userid': items.userId, 'userName': $scope.userName});
    };
}]);

'use strict';

angular.module('adminPageApp').controller('AuditCtrl',["$scope", "$q", "$uibModal", "$http", "$timeout", "userDetailsService", function($scope, $q,$uibModal, $http, $timeout, userDetailsService){
    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.myData = {}; 
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.$emit('resetSearchText');
    $scope.$emit('resetGroup');
    
    $scope.popup1 = {
        opened: false,
        dt: new Date(),
        minDate: null,
        maxDate: new Date()
    };
    $scope.popup1.dt.setDate($scope.popup1.dt.getDate()-7);
    $scope.popup2 = {
        opened: false,
        dt: new Date(),
        minDate: $scope.popup1.dt,
        maxDate: new Date()
    };
    $scope.downloadLink = "/BITool/audit/downloadAuditReport?searchReportName="; 
    $scope.open1 = function() {
        $scope.popup1.opened = true;
    };
    $scope.open2 = function() {
        $scope.popup2.opened = true;
    };
    $scope.filterAudit = function() {
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();   
    };
    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };
    
    function columnDefs(){
        return [
            /*{name: 'reportId', isplayName:'Report Id' , width:'10%', cellToolTip:true },*/
            {name: 'reportType',displayName:'Report Type' ,width:'10%', cellToolTip:true/*, cellTemplate:"<span>{{row.entity.lastName}}<span ng-show='row.entity.lastName && row.entity.firstName'>,</span> {{row.entity.firstName}}</span>"*/},
            {name: 'functionalArea',displayName:'Functional Area' ,width:'15%', cellToolTip:true},
            {name: 'accessDate',displayName:'Date' ,width:'15%', cellToolTip:true, cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.accessDate | date:"MM/dd/yy h:mm:ss a"}}</div>'},
            {name: 'sourceSystem',displayName:'Source System' ,width:'15%', cellToolTip:true},
            {name: 'sourceReportId',displayName:'Source Report Id' ,width:'15%', cellToolTip:true},
            {name: 'type',displayName:'Type' ,width:'10%', cellToolTip:true},
            {name: 'reportName',displayName:'Report Name' ,width:'15%', cellToolTip:true},
            {name: 'userName',displayName:'User Name' ,width:'15%', cellToolTip:true},
            {name: 'userPersona',displayName:'User Persona' ,width:'15%', cellToolTip:true},
            {name: 'owner',displayName:'Owner' ,width:'15%', cellToolTip:true},
            {name: 'groupName',displayName:'Audit Persona' ,width:'15%', cellToolTip:true}
        ];
    }

    function onRegisterApi (gridApi){
        $scope.gridApi=gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateAudit);
    };
    
    $scope.myData= {
        enableRowSelection              : true,
        infiniteScrollRowsFromEnd       : 20,
        infiniteScrollUp                : false,
        infiniteScrollDown              : true,
        data                            :[],
        columnDefs                      :columnDefs(),
        onRegisterApi                   : onRegisterApi
    };
    
    //Continue the code for update and new when the webservices are provided
    $scope.searchTextValue = '';
    $scope.searchPersonaValue = '';
    $scope.searchGroupValue = 0;
    var searchPromises = [];
    
    //groups dropdown on leftpanel
    userDetailsService.userPromise.then(function(userObj){
        userObj = userObj[0];
        var url;
        
        if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'admin' ) {
            url = 'BITool/buAdmin/getBUAdminGroup/?userName=';
        } else if (userObj.userinfo && userObj.userinfo.role.toLowerCase() === 'buadmin') {
            url = 'BITool/buAdmin/getBIGroupForBUAdmin/?userName=';
        }
        
        url = url+userObj.emcLoginName;
        
        $http.get(url).then(function(resp){
            var group = _.sortBy(resp.data, 'groupName');
            $scope.$emit('emitAuditGroup', group);
        });
    });
   
    function cancelPendingPromise () {
        _.map(searchPromises, function(eachPromise){
            eachPromise.cancelService();
        });
        
        searchPromises = [];
    }
    
    $scope.$on('searchReportAudit', function(event, searchTxt){
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();
    });
    
    $scope.$on('broadcastAuditPersona', function(event, searchTxt){
        $scope.searchPersonaValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();
    });
 
    $scope.$on('broadcastAuditGroup', function(event, searchTxt){
        if (searchTxt) {
            $scope.searchGroupValue = searchTxt;
        } else {
            $scope.searchGroupValue = 0;
        }
        
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateAudit();
    });
 
    $scope.updateAudit = function(){
        var offset = $scope.myData.data.length+1;
        var promise = $q.defer();
        var canceller = $q.defer();
        
        var httpPromise = $http({
            'url': 'BITool/audit/getBIAuditSearchReport/'+offset+'/20?searchReportName='+$scope.searchTextValue+'&searchReportType='+$scope.searchPersonaValue+'&searchGroupId='+$scope.searchGroupValue+'&searchFromDate='+$scope.popup1.dt.toISOString().substring(0, 10)+' 00:00:00'+'&searchToDate='+$scope.popup2.dt.toISOString().substring(0, 10)+' 23:59:59',
            'method': 'get',
            'timeout': canceller.promise
        }).then(function(resp){
            if($scope.myData.data.length===0){
                $scope.myData.data=resp.data;
            }else{
                $scope.myData.data = $scope.myData.data.concat(resp.data);
            }
        
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function(){
                promise.resolve();
            });
        });
        
        httpPromise.cancelService = function(){
             canceller.resolve();
        };
        
        searchPromises.push(httpPromise);
        
        return promise.promise;
    };
    
    $scope.updateAudit();
        
    $scope.$watch('messageAlert',function(){
        $timeout(function(){
            $scope.messageAlert= "";
        },5000);
    });
//end    
}]);
'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:RecommendCtrl
 * @description
 * # RecommendCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('RecommendCtrl', ["$scope", "$q", "$uibModal", "$http", "$timeout", "userDetailsService", function ($scope, $q, $uibModal, $http, $timeout, userDetailsService) {
    var myData1 = {}, 
        myData2 = {},
        selectedReportList = [], 
        searchPromises = [], 
        removedList = [];
    $scope.userGroupId = '';
    $scope.recommendedCount = '';
    $scope.maxSelected = false; 
    $scope.selected = false; 
    $scope.deSelected = false;
    $scope.selectedMove = false;
    $scope.$emit('resetSearchText');
    
    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.columnDefs
     * @description
     * Columns options defiened, returns an array of columns definition objects. Each object allows you to assign specific options to columns in the table.
     * Please refer link: https://github.com/angular-ui/ui-grid/wiki/defining-columns
     */
    function columnDefs() {
        return [
            {name: 'radiobutton', displayName: '', width: 25, enableSorting: false, cellTemplate: '<div><input ng-checked="row.isSelected" name="radioButton" type="radio" ng-value="row.entity.sourceReportId"></div>'},
            {name: 'id', displayName: 'Report ID', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'name', displayName: 'Report Name', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'type', displayName: 'Type', enableCellEdit: false, width: '100', cellTooltip: true}
        ];
    }
    
    //
    function onRegisterApi (gridApi1){
        $scope.gridApi1 = gridApi1;
        //infiniteScroll functionality for adding more rows.
        //gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateReportForm);

        //Click on each row of table.
        gridApi1.selection.on.rowSelectionChanged($scope,function(row){
            $scope.gridApi2.selection.clearSelectedRows();
            var promiseObj = angular.copy(row.entity);
            var removeRowIndex = $scope.myData1.data.indexOf(row.entity);
            promiseObj['index1'] = removeRowIndex; 
            myData1 = promiseObj;
            statusFlag(true, false);
        });
    }
    
    //
    function onRegisterApiList (gridApi2){
        $scope.gridApi2 = gridApi2;
        //Click on each row of table.
        gridApi2.selection.on.rowSelectionChanged($scope,function(row){
            $scope.gridApi1.selection.clearSelectedRows();
            var promiseObj = angular.copy(row.entity);
            var removeRowIndex = $scope.myData2.data.indexOf(row.entity);
            promiseObj['index2'] = removeRowIndex; 
            myData2 = promiseObj;
            statusFlag(false, true);
        });
    }
    
    //
    function cancelPendingPromise () {
        _.map(searchPromises, function(eachPromise){
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    //Properties for Ui grid.
    $scope.myData1 = {
        enableRowSelection              : true, 
        enableRowHeaderSelection        : false,
        multiSelect                     : false,
        modifierKeysToMultiSelect       : false,
        noUnselect                      : true,
        data                            : [],
        columnDefs                      : columnDefs(),
        onRegisterApi                   : onRegisterApi
    };
    
    //Properties for Ui grid.
    $scope.myData2 = {
        enableRowSelection              : true, 
        enableRowHeaderSelection        : false,
        multiSelect                     : false,
        modifierKeysToMultiSelect       : false,
        noUnselect                      : true,
        data                            : [],
        columnDefs                      : columnDefs(),
        onRegisterApi                   : onRegisterApiList
    };
    
    //left menue
    userDetailsService.userPromise.then(function(userObj){
        userObj = userObj[0].userinfo.group;
        $scope.userGroupId = ($scope.userGroupId) ? $scope.userGroupId : userObj[0].groupId;
        var url = 'BITool/biReport/getRecommendedReportPage/?personaId='+$scope.userGroupId;
        
        $http.get(url).then(function(resp){
            $scope.recommendedCount = resp.data.recommendedCount;
            var data = resp.data.biGroupDTOList;
            $scope.$emit('emitUserGroup', data, userObj[0]);
        });
        $scope.updateReportForm();
    });
    
    //
    $scope.$on('broadcastUserGroup', function(event, userGroup){
        $scope.userGroupId = userGroup;
        cancelPendingPromise();       
        resetAll();
        $scope.updateReportForm();
    });
    
    $scope.updateReportForm = function() {
        var promise = $q.defer();
        var canceller = $q.defer();

        var httpPromise = $http({
            'url' : 'BITool/biReport/getRecommendedReportPage/?personaId='+$scope.userGroupId,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function(resp){
            var data = resp.data.biReportDTOList;       

            _.map(data, function(report) {
                if(report && report.recommendedSeq !== null && report.recommendedSeq !== 0) {
                    selectedReportList.push(report);
                }
            });
            
            selectedReportList = _.sortBy(selectedReportList, 'recommendedSeq');
            
            data = _.difference(data, selectedReportList);

            if($scope.myData1.data.length === 0){
                $scope.myData1.data = data;
            }else{
                $scope.myData1.data = $scope.myData1.data.concat(data);
            }

            if(selectedReportList.length === 0){
                $scope.myData2.data = [];
            }else{
                $scope.myData2.data = selectedReportList;
            }
        });

        httpPromise.cancelService = function(){
            canceller.resolve();
        };

        searchPromises.push(httpPromise);

        return promise.promise;
    };
    
    //
    $scope.selectedReport = function () {
        checkMaxSelection();
        if(selectedReportList.length < $scope.recommendedCount && !_.isEmpty(myData1)) {
            $scope.myData1.data.splice(myData1.index1, 1);
            selectedReportList.push(myData1);
            $scope.myData2.data = selectedReportList;
            updateRemovedList(myData1, false);
            myData1 = {};
        } 
        statusFlag(false, false);
    };
    
    //
    $scope.deSelectedReport = function () {
        if(selectedReportList.length && !_.isEmpty(myData2)) {
            selectedReportList.splice(myData2.index2, 1);
            $scope.myData1.data.splice(0, 0, myData2);
            $scope.myData2.data = selectedReportList;
            updateRemovedList(myData2, true);
            myData2 = {};
        }
        statusFlag(false, false);
    };
    
    //
    $scope.cancelSelectedReport = function () {
        resetAll();
        statusFlag(false, false);   
        $scope.updateReportForm();
    };
    
    //
    $scope.updateRecommendedReport = function () {
        
        var biReportDTOList = [];

        biReportDTOList = _.map($scope.myData2.data, function(report, index) {
            return {
                "id": report.id, 
                "levelId": report.levelId, 
                "groupId": report.groupId, 
                "recommendedSeq": index+1
            };  
        });
        
        $scope.progress = false;
        $scope.saveText = '';
        
        var postObject = {
            "biReportDTOList" : biReportDTOList,
            "deletedBIReportDTOList" : removedList
        }
        
        $http.put("BITool/biReport/saveRecommendedReportPage/",postObject)
            .then(function (updatedData, status, headers) {
                $scope.progress = false;
                $scope.saveText = 'Recommended Reports are added successfully';
                $timeout(function(){
                    $scope.saveText = '';
                }, 5000);
                removedList = [];
            }, function (updatedData, status, headers, config) {
                $scope.progress = false;
                $scope.saveText = '';
                removedList = [];
            });
    };
    
    //
    $scope.move = function(pos) {
        if(!_.isEmpty(myData2)) {
            if(pos) {
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice(0, 0, myData2);
            } else {
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice($scope.myData2.data.length, 0, myData2);
            }
        }
        statusFlag(false, false);
        myData2 = {};
    };
    
    //
    $scope.moveUpDown = function(pos) {
        if(!_.isEmpty(myData2)) {
            if(pos) {
                var index = ((myData2.index2 - 1) < 0 ) ? 0 : myData2.index2 - 1;
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice(index, 0, myData2);
            } else {
                $scope.myData2.data.splice(myData2.index2, 1);
                $scope.myData2.data.splice(myData2.index2 + 1, 0, myData2);
            }
        }
        statusFlag(false, false);
        myData2 = {};
    };
    
    //
    function checkMaxSelection() {
        $scope.maxSelected = false;
        
        if(selectedReportList.length === $scope.recommendedCount) {
            $scope.maxSelected = true;
            $timeout(function(){
                $scope.maxSelected = false;
            }, 5000);
        }
    }
    
    //
    function updateRemovedList(report, flag) {
        var index = _.findLastIndex(removedList, {id: report.id, levelId: report.levelId});
        if(flag) {
            if(index < 0) {
                (_.pick(report, 'index1'))? delete report.index1 : ''; 
                (_.pick(report, 'index2'))? delete report.index2 : '';
                removedList.push(report);
            }
        } else {
            if(index >= 0) {
                removedList.splice(index,1);
            }
        }
    }
    
    //
    function statusFlag(status1, status2) {
        $scope.selected = status1;
        $scope.deSelected = status2;
        $scope.selectedMove = status2;
    }
    
    //
    function resetAll() {
        $scope.myData1.data = [];
        $scope.myData2.data = [];
        selectedReportList = [];
        removedList = [];
        myData1 = {};
        myData2 = {};
    }
}]);
'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:ExternalCtrl
 * @description
 * # ExternalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ExternalCtrl', ["$scope", "$http", "$filter", "$uibModal", "$q", "$timeout", "userDetailsService", function ($scope, $http, $filter, $uibModal, $q, $timeout, userDetailsService) {
    $scope.searchTextValue = '';
    $scope.displayType = '';
    $scope.personaId = '';
    var searchPromises = [];
    $scope.$emit('resetDisplayType', 'All');
    $scope.$emit('resetSearchText');
    
    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.columnDefs
     * @description
     * Columns options defiened, returns an array of columns definition objects. Each object allows you to assign specific options to columns in the table.
     * Please refer link: https://github.com/angular-ui/ui-grid/wiki/defining-columns
     */
    function columnDefs() {
        return [
            {name: 'radiobutton', displayName: '', width: 25, enableSorting: false, cellTemplate: '<div><input ng-checked="row.isSelected"   name="radioButton" type="radio" ng-value="row.entity.sourceReportId" > </div>'},
            {name: 'id', displayName: 'Report ID', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportName', displayName: 'Report Name', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'sourceSystem', displayName: 'Source System', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportDesc', displayName: 'Description', enableCellEdit: false, width: '300', cellTooltip: true},
            {name: 'reportLink', displayName: 'Report Link', enableCellEdit: false, width: '300', cellTooltip: true},
            {name: 'reportType', displayName: 'Type', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'functionalArea', displayName: 'Functional Area', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'owner', displayName: 'Created By', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'additionalInfo', displayName: 'Tile Color', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'updatedDate', displayName: 'Updated Date', enableCellEdit: false, width: '100', cellTooltip: true}
        ];
    }

    /**
     * @ngdoc function
     * @name adminPageApp.controller:AboutCtrl.onRegisterApi
     * @description
     * A callback that returns the gridApi once the grid is instantiated, which is then used to interact with the grid programatically.
     * Note that the gridApi.core.renderingComplete event is identical to this callback, but has the advantage that it can be called from multiple places if needed
     */
    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateReportForm);

        //Click on each row of table.
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            var promiseObj = $scope.open(angular.copy(row.entity));
            promiseObj.then(function (resp) {
                row.entity = resp;
            });
        });
    }

    //Properties for Ui grid.
    $scope.myData = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };
    
    $scope.downloadExtDeployedReport = '/BITool/admin/downloadExtDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;

    //Modal open callBack.
    $scope.open = function (row) {
        var defer = $q.defer();

        var modalInstance = $uibModal.open({
            templateUrl: 'views/modal.html',
            controller: 'ModalCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return row;
                }
            }

        });
        
        modalInstance.result.then(function (returnObj) {
            $scope.myData.data = [];
            $scope.updateReportForm();
        }, function () {
            //OnCancel
        });
        
        return defer.promise;
    };

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }

    $scope.$on('broadcastDeployedSelection', function (event, displayType, personaId) {
        $scope.displayType = (displayType === 'All')? '' : displayType;
        $scope.personaId = personaId;
        $scope.downloadExtDeployedReport = '/BITool/admin/downloadExtDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('broadcastDeployedReportGroup', function (event, displayType, personaId) {
        $scope.displayType = displayType;
        $scope.personaId = personaId;
        $scope.downloadExtDeployedReport = '/BITool/admin/downloadExtDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.$on('searchTextUpdate', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        $scope.downloadExtDeployedReport = '/BITool/admin/downloadExtDeployedReport?personaId='+$scope.personaId+'&searchText='+$scope.searchTextValue;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });

    $scope.updateReportForm = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        //for cancelling the running service.
        var canceller = $q.defer();
        
        if($scope.personaId && $scope.displayType === 'Deployed') {
            var url = 'BITool/admin/externalrepo/searchreports/' + offset + '/20?searchText=' + $scope.searchTextValue +'&displayType=' + $scope.displayType+'&personaId=' + $scope.personaId;
        } else {
            var url = 'BITool/admin/externalrepo/searchreports/' + offset + '/20?searchText=' + $scope.searchTextValue +'&displayType=' + $scope.displayType;
        }
        
        var httpPromise = $http({
            'url': url,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {

            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data);
            }

            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function () {
                promise.resolve();
            });
        });

        httpPromise.cancelService = function () {
            canceller.resolve();
        };

        searchPromises.push(httpPromise);
        return promise.promise;
    };

    $scope.updateReportForm();
}]);
'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:AddExternalCtrl
 * @description
 * # AddExternalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ManageExternalCtrl', ["$scope", "$q", "$uibModal", "$http", "$timeout", "userDetailsService", function ($scope, $q, $uibModal, $http, $timeout, userDetailsService) {
    $scope.urlValid = false;
    $scope.external = {};
    $scope.messageAlert= "";
    $scope.messageAlertError='';
    $scope.searchText = '';
    var searchPromises = [];
    $scope.$emit('resetDisplayForm', 'edit');
    $scope.$emit('resetSearchText');
    $scope.external.additionalInfo = "#0000FF";
    $scope.external.displayType = 'N';
    /**
     * Search Edit report functions 
     */
    function columnDefs() {
        return [
            {name: 'radiobutton', displayName: '', width: 25, enableSorting: false, cellTemplate: '<div><input ng-checked="row.isSelected"   name="radioButton" type="radio" ng-value="row.entity.sourceReportId" > </div>'},
            {name: 'id', displayName: 'Report ID', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportName', displayName: 'Report Name', enableCellEdit: false, width: '200', cellTooltip: true},
            {name: 'sourceSystem', displayName: 'Source System', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'reportDesc', displayName: 'Description', enableCellEdit: false, width: '300', cellTooltip: true},
            {name: 'reportLink', displayName: 'Report Link', enableCellEdit: false, width: '300', cellTooltip: true},
            {name: 'reportType', displayName: 'Type', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'functionalArea', displayName: 'Functional Area', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'owner', displayName: 'Created By', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'additionalInfo', displayName: 'Tile Color', enableCellEdit: false, width: '100', cellTooltip: true},
            {name: 'updatedDate', displayName: 'Updated Date', enableCellEdit: false, width: '100', cellTooltip: true}
        ];
    }
    
    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        //infiniteScroll functionality for adding more rows.
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateReportForm);

        //Click on each row of table.
        gridApi.selection.on.rowSelectionChanged($scope, function (row) {
            var promiseObj = $scope.open(angular.copy(row.entity));
            promiseObj.then(function (resp) {
                row.entity = resp;
            });
        });
    }
    
    //Properties for Ui grid.
    $scope.myData = {
        enableRowSelection: true,
        enableRowHeaderSelection: false,
        multiSelect: false,
        modifierKeysToMultiSelect: false,
        noUnselect: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: false,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };
    
    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    //Modal open callBack.
    $scope.open = function (row) {
        var defer = $q.defer();

        var modalInstance = $uibModal.open({
            templateUrl: 'views/modalExternal.html',
            controller: 'ExternalModalCtrl',
            size: 'lg',
            resolve: {
                items: function () {
                    return row;
                }
            }

        });
        
        modalInstance.result.then(function (returnObj) {
            //var returnItems = returnObj.items;
            //defer.resolve(returnItems);
            $scope.myData.data = [];
            $scope.updateReportForm();
        }, function () {
            //OnCancel
        });
        
        return defer.promise;
    };
    
    $scope.$on('searchTextUpdate', function (event, searchTxt) {
        $scope.searchText = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateReportForm();
    });
    
    $scope.updateReportForm = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        //for cancelling the running service.
        var canceller = $q.defer();
        var url = 'BITool/admin/externalrepo/searchreports/' + offset + '/20?searchText=' + $scope.searchText +'&displayType=';
        
        var httpPromise = $http({
            'url': url,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {

            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data);
            }

            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function () {
                promise.resolve();
            });
        });

        httpPromise.cancelService = function () {
            canceller.resolve();
        };

        searchPromises.push(httpPromise);
        return promise.promise;
    };
    
    $scope.$on('emitDisplayForm', function(event, displayForm) {
       $scope.displayForm = displayForm;
    });
    
    $scope.updateReportForm();
    
    /**
     * Add report Functions 
     */
    
    //Help pop over object
    $scope.popAdditionalInfo = {
        content : 'Use Hexadecimal Color Codes here. eg: #000000 for black color tile',
        title : 'Please Note:',
        placement:'top',
        class:'additiona-info'
    };
    
    userDetailsService.userPromise.then(function(userObj){
        userObj = userObj[0];
        $scope.reportPersona = userObj.userinfo.group[0].groupId;
    });

    $scope.validateUrl = function(url) {
        var urlIndex = (url) ? url.indexOf('http') && url.indexOf('//') : -1;
        (urlIndex > -1) ? $scope.urlValid = true : $scope.urlValid = false;
    };
    
    $scope.addExternal = function(external) {
        $scope.messageAlert= "Saving "+external.reportName+"...";
        $scope.messageAlertError = '';
        $scope.external  = external;
        $scope.external.groupId = $scope.reportPersona;

        $http.post('BITool/admin/externalrepo/savereport', $scope.external)
            .then(function(resp) {
                if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                    $scope.messageAlert= resp.data.message;
                    $scope.messageAlertError = '';
                    clearMessage(); 
                    $scope.clearForm();
                } else {
                    $scope.messageAlert ='';
                    $scope.messageAlertError= resp.data.message;
                    clearMessage();
                }
            },function(){
                $scope.messageAlert ='';
                $scope.messageAlertError= resp.data.message;
                clearMessage();
            });
    };
    
    function clearMessage() {
        $timeout(function() {
            $scope.messageAlert= '';
            $scope.messageAlertError = '';
        }, 4000);
    }
    
    $scope.clearForm = function() {
//        $scope.external = {
//            reportName : '',
//            reportDesc : '',
//            reportLink : '',
//            functionalArea: '',
//            linkTitle :'',
//            linkHoverInfo :'',
//        };
        $scope.external = {};
        $scope.external.additionalInfo = "#0000FF";
    };
}]);
'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:ExternalModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ExternalModalCtrl', ["$scope", "$uibModalInstance", "items", "$http", "$q", function ($scope, $uibModalInstance, items, $http, $q) {
    $scope.items = items;
    $scope.levelGroupMaps = [{
        'selectedlevel': 0,
        'selectedgroup': 0
    }];
    $scope.updatefields = true;
    $scope.progress = false;
    $scope.saveText = '';
    
    $http.get('BITool/admin/externalrepo/searchreport/' + $scope.items.sourceReportId)
        .then(function (response) {
            var resp = response.data;
            $scope.items.owner = resp.owner;
            $scope.items.reportDesc = resp.reportDesc;
            $scope.items.refreshStatus = (resp.refreshStatus) ? resp.refreshStatus : 'N';
            $scope.items.tabbedViews = (resp.tabbedViews) ? resp.tabbedViews : 'N';
            //$scope.items.recommended = (resp.recommended)? resp.recommended : 'N';
            $scope.items.reportLink = resp.reportLink;
            $scope.items.functionalArea = resp.functionalArea;
            $scope.items.functionalAreaLvl1 = resp.functionalAreaLvl1;
            $scope.items.functionalAreaLvl2 = resp.functionalAreaLvl2;
            $scope.items.linkTitle = resp.linkTitle;
            $scope.items.linkHoverInfo = resp.linkHoverInfo;
            $scope.items.createdDate = resp.createdDate;
            $scope.items.updatedDate = resp.updatedDate;
            $scope.items.sourceSystem = resp.sourceSystem;
            $scope.items.viewCount = resp.viewCount;
            $scope.items.additionalInfo = resp.additionalInfo;
            $scope.items.systemDescription = resp.systemDescription;
            $scope.items.reportName = resp.reportName;
            $scope.items.reportType = resp.reportType;
        });

    $scope.ok = function () {
        delete $scope.items.createdBy;
        delete $scope.items.updatedBy;
        delete $scope.items.groupId;
        delete $scope.items.groupName;
        
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $scope.saveText = 'saving...';
        $scope.progress = true;
        
        $http.put("BITool/admin/updateReport?isManageExternalUpdate=true", $scope.items)
            .then(function (updatedData, status, headers) {
                $scope.progress = false;
                $scope.saveText = updatedData.data.message;
            }, function (updatedData, status, headers, config) {
                $scope.progress = false;
                $scope.saveText = updatedData.data.message;
            });
        //$uibModalInstance.close(returnObj);
    };

    $scope.cancel = function () {
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $uibModalInstance.close(returnObj);
    };
}]);
'use strict';

angular.module('adminPageApp').controller('NotificationCtrl', ["$scope", "$http", "$uibModal", "$q", "$timeout", function ($scope, $http, $uibModal, $q, $timeout) {
    $scope.messageAlert = "";
    $scope.messageAlertError = '';
    $scope.myData = {};
    $scope.$emit('resetSearchText');
    $scope.$emit('resetIconFlag', false);
    var groupIdList = [];
    $scope.searchTextValue = '';
    $scope.personaId = '';
    var searchPromises = [];
    
    function columnDefs() {
        return[
            {name: 'Options', width: '8%', cellTemplate: 'views/adminDropdown.html'},
            {name: 'notificationId', displayName: 'ID', width: '6%', cellTooltip: true},
            {name: 'header', displayName: 'Title', width: '13%', cellTooltip: true},
            {name: 'messageBody', displayName: 'Message', width: '15%', cellTooltip: true},
            {name: 'notificationType', displayName: 'Type', width: '6%', cellTooltip: true, cellTemplate:"<div class='ui-grid-cell-contents'>{{(row.entity.notificationType === 'M') ? 'Message' : 'Alert'}}</div>"},
            {name: 'isActive', displayName: 'Is Active', width: '6%', cellTooltip: true, cellTemplate:"<div class='ui-grid-cell-contents'>{{(row.entity.isActive === 'Y') ? 'Yes' : 'No'}}</div>"},
            {name: 'biCreatedDate', displayName: 'Created Date', width: '13%', cellTooltip: true, cellTemplate:'<div class="ui-grid-cell-contents">{{row.entity.biCreatedDate | date:"MM/dd/yy h:mm:ss a"}}</div>'},
            {name: 'biUpdatedDate', displayName: 'Updated Date', width: '13%', cellTooltip: true, cellTemplate:'<div class="ui-grid-cell-contents">{{(row.entity.biUpdatedDate)? (row.entity.biCreatedDate | date:"MM/dd/yy h:mm:ss a") : ""}}</div>'},
            {name: 'persona', displayName: 'Persona', width: '10%', cellTooltip: true},
            {name: 'owner', displayName: 'Owner', width: '15%', cellTooltip: true}
        ];
    }

    function onRegisterApi(gridApi) {
        $scope.gridApi = gridApi;
        gridApi.infiniteScroll.on.needLoadMoreData($scope, $scope.updateNotificationForm);
    };

    $scope.myData = {
        enableRowSelection: true,
        infiniteScrollRowsFromEnd: 20,
        infiniteScrollUp: false,
        infiniteScrollDown: true,
        data: [],
        columnDefs: columnDefs(),
        onRegisterApi: onRegisterApi
    };
    
    $scope.$on('searchTextUpdate', function (event, searchTxt) {
        $scope.searchTextValue = searchTxt;
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateNotificationForm();
    });

    $scope.$on('broadcastAuditGroup', function(event, personaId){
        (personaId) ? $scope.personaId = personaId : $scope.personaId = '';
        cancelPendingPromise();
        $scope.myData.data = [];
        $scope.updateLevel();
    });

    $scope.deleteItems = function (row) {
        var modalInstance = $uibModal.open({
            templateUrl: 'views/deleteModal.html',
            controller: 'deleteModalCtrl',
            resolve: {
                items: function () {
                    row.id = row.notificationId;
                    return {
                        pageType: 'Notification',
                        data: row
                    };
                }
            }
        });

        modalInstance.result.then(function (deleteObjID) {
            var newArray = $scope.myData.data;
            $scope.messageAlert = "Deleting Notification " + deleteObjID;
            $scope.messageAlertError = '';
            $http.delete('BITool/admin/deleteNotification/' + deleteObjID)
                .then(function (response, status, headers) {
                    if (response.data && response.data.status && response.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Notification " + deleteObjID + " deleted successfully";
                        var deleteObj = {};
                        for (var i = 0; i < $scope.myData.data.length; i++) {
                            var eachEle = $scope.myData.data[i];
                            if (eachEle.id === deleteObjID) {
                                deleteObj = eachEle;
                            }
                        }

                        var index = $scope.myData.data.indexOf(deleteObj);
                        $scope.myData.data.splice(index, 1);
                    } else {
                        $scope.messageAlert = "";
                        $scope.messageAlertError = "Error While Deleting the Notification " + deleteObjID;
                        if (response.data && response.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + response.data.message
                        }
                    }
                }, function (newArray, status, headers, config) {
                    $scope.messageAlert = "";
                    $scope.messageAlertError = "Error While Deleting the Notification " + deleteObjID;
                });
        });
    };

    $scope.open = function (row) {
        var defer = $q.defer();
        var modalInstance = $uibModal.open({
            templateUrl: 'views/NotificationModal.html',
            controller: 'NotificationModelCtrl',
            resolve: {
                items: function () {
                    if (row === undefined) {
                        return {'type': 'new', groupIdList : groupIdList};
                    } else {
                        return {'type': 'edit', groupIdList : groupIdList, data: angular.copy(row)};
                    }
                }
            }
        });
        
        modalInstance.result.then(function (notificationObj) {
            if (notificationObj.type && notificationObj.type === 'new') {
                var postObj = _.omit(notificationObj, 'type');
                $scope.messageAlert = "Saving " + notificationObj.header + "...";
                $scope.messageAlertError = '';
                
                $http.post('BITool/admin/saveOrUpdateNotification', postObj).then(function (resp) {
                    if (resp.data && resp.data.status && resp.data.status.toLowerCase() === 'success') {
                        $scope.messageAlert = "Notification " + notificationObj.header + " saved successfully";
                        $scope.myData.data = [];
                        $scope.updateNotificationForm();
                    } else {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While Saving the Notification " + notificationObj.header;
                        if (resp.data && resp.data.message) {
                            $scope.messageAlertError = $scope.messageAlertError + ', ' + resp.data.message
                        }
                    }

                }, function () {
                    $scope.messageAlert = '';
                    $scope.messageAlertError = "Error While Saving the Notification " + notificationObj.header;
                });

            } else {
                notificationObj.notificationId = parseInt(notificationObj.notificationId);
                $scope.messageAlert = "Updating " + notificationObj.header + "...";
                $scope.messageAlertError = '';

                $http.post('BITool/admin/saveOrUpdateNotification', notificationObj)
                    .then(function (updateNotification, status, headers) {
                        if (updateNotification.data && updateNotification.data.status && updateNotification.data.status.toLowerCase() === 'success') {
                            $scope.messageAlert = "Notification " + notificationObj.header + " updated successfully";
                            $scope.myData.data = [];
                            $scope.updateNotificationForm();
                        } else {
                            $scope.messageAlert = '';
                            $scope.messageAlertError = "Error While updating the Notification " + notificationObj.header;
                            if (updateNotification.data && updateNotification.data.message) {
                                $scope.messageAlertError = $scope.messageAlertError + ', ' + updateNotification.data.message
                            }
                        }
                    }, function (updateNotification, status, headers, config) {
                        $scope.messageAlert = '';
                        $scope.messageAlertError = "Error While updating the Notification " + notificationObj.header;
                    });
            }
            defer.resolve(notificationObj);
        }, function () {

        });
        return defer.promise;
    };

    function cancelPendingPromise() {
        _.map(searchPromises, function (eachPromise) {
            eachPromise.cancelService();
        });
        searchPromises = [];
    }
    
    $scope.updateNotificationForm = function () {
        var offset = $scope.myData.data.length + 1;
        var promise = $q.defer();
        var canceller = $q.defer();
        var httpPromise = $http({
            'url': 'BITool/admin/getNotificationList/' + offset + '/20?searchText=' + $scope.searchTextValue + '&personaId=' + $scope.personaId,
            'method': 'get',
            'timeout': canceller.promise
        }).then(function (resp) {
            $http.get('BITool/buAdmin/getBUAdminGroupByRole').then(function(resp){
                groupIdList = _.sortBy(resp.data, 'groupName');
                $scope.$emit('emitAuditGroup', groupIdList);
            });
            
            if ($scope.myData.data.length === 0) {
                $scope.myData.data = resp.data;
            } else {
                $scope.myData.data = $scope.myData.data.concat(resp.data);
            }
            
            $scope.gridApi.infiniteScroll.saveScrollPercentage();
            $scope.gridApi.infiniteScroll.dataLoaded(false, resp.data && resp.data.length === 20).then(function () {
                promise.resolve();
            });
        });
        httpPromise.cancelService = function () {
            canceller.resolve();
        };
        searchPromises.push(httpPromise);
        return promise.promise;
    };

    $scope.updateNotificationForm();

    $scope.$watch('messageAlert', function () {
        $timeout(function () {
            $scope.messageAlert = "";
        }, 5000);
    });

    $scope.$watch('messageAlertError', function () {
        $timeout(function () {
            $scope.messageAlertError = "";
        }, 5000);
    });

}]);

angular.module('adminPageApp').controller('NotificationModelCtrl', ["$scope", "$uibModalInstance", "items", "$http", function ($scope, $uibModalInstance, items, $http) {
    if (items.type && items.type === 'new') {
        $scope.items = {
            "notificationId": null,
            "groupId": null,
            "header": "",
            "messageBody": "",
            "notificationType": "M",
            "isActive":"Y",
            "type": 'new'
        };
        
        $scope.groupIdList = items.groupIdList;
    } else {
        $scope.items = items.data;
        $scope.groupIdList = items.groupIdList;
        $scope.items.notificationType = items.data.notificationType;
    }
    
    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.save = function (notificationObj) {
        notificationObj = _.omit(notificationObj,'id');
        if(notificationObj.type==='new') {
//            $scope.notificationObj = notificationObj;
            console.log(notificationObj);
            $uibModalInstance.close(notificationObj);
        } else {
            notificationObj = _.omit(notificationObj,'biUpdatedBy');
            notificationObj = _.omit(notificationObj,'biUpdatedDate');
            notificationObj = _.omit(notificationObj,'biCreatedBy');
            notificationObj = _.omit(notificationObj,'biCreatedDate');
            notificationObj = _.omit(notificationObj,'biDeletedBy');
            notificationObj = _.omit(notificationObj,'biDeletedDate');
            notificationObj = _.omit(notificationObj,'owner');
            notificationObj = _.omit(notificationObj,'persona');
            notificationObj = _.omit(notificationObj,'reportId');
            $scope.notificationObj = notificationObj;
            console.log(notificationObj);
            $uibModalInstance.close(notificationObj);
        }
    };
}]);
'use strict';

/**
 * @ngdoc directive
 * @name myBiApp.directive:ngFiles
 * @description
 * # ngFiles
 */
angular.module('adminPageApp')
.directive('ngFiles', ["$parse", function ($parse) {
    function fn_link(scope, element, attrs) {
        var onChange = $parse(attrs.ngFiles);
        element.on('change', function (event) {
            onChange(scope, {$files: event.target.files});
        });
    };

    return {
        link: fn_link
    };
}]);

'use strict';

/**
 * @ngdoc directive
 * @name myBiApp.directive:ngFiles
 * @description
 * # ngFiles
 */
angular.module('adminPageApp')
.directive('validFile', function () {
    var validFormats = ['csv'];
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ngModel) {
            elem.bind('change', function () {
                validImage(false);
                scope.$apply(function () {
                    ngModel.$render();
                });
            });
            ngModel.$render = function () {
                ngModel.$setViewValue(elem.val());
            };
            function validImage(bool) {
                ngModel.$setValidity('extension', bool);
            }
            ngModel.$parsers.push(function (value) {
                var ext = value.substr(value.lastIndexOf('.') + 1);
                if (ext == '')
                    return;
                if (validFormats.indexOf(ext) == -1) {
                    return value;
                }
                validImage(true);
                return value;
            });
        }
    };
});
'use strict';

/**
 * @ngdoc directive
 * @name myBiApp.directive:dropdownMultiselect
 * @description
 * # dropdownMultiselect
 * 
 * http://dotansimha.github.io/angularjs-dropdown-multiselect/#/
 * http://jsfiddle.net/ajm2hvxd/78/
 * 
 */
angular.module('adminPageApp')
.directive('dropdownMultiselect', function () {
    return {
        restrict: 'E',
        scope: {
            model: '=',
            options: '=',
            selectedModel : '='
            //pre_selected: '=preSelected',
            //dropdownTitle: '@'
        },
        template: "<div class='btn-group' data-ng-class='{open: open}' data-ng-model='selectedGroupIdList'>" +
                "<button class='btn btn-small'  data-ng-click='toggleDropdown()'>{{getButtonText()}}&nbsp;</button>" +
                "<button class='btn btn-small dropdown-toggle' data-ng-click='toggleDropdown()'><span class='caret'></span></button>" +
                "<ul class='dropdown-menu scrollable-menu' aria-labelledby='dropdownMenu'>" +
                "<li><input type='checkbox' data-ng-change='checkAllClicked()' data-ng-model=checkAll> Check All</li>" +
                "<li class='divider'></li>" +
                "<li data-ng-repeat='option in options'><div class='checkbox'><label for=''><input type='checkbox' data-ng-change='setSelectedItem(option.groupId)' ng-model='selectedItems[option.groupId]'>{{option.groupName}}</label></div></li>" +
                "</ul>" +
                "</div>",
        link: function (scope, element, attr) {

            scope.selectedItems = {};
            scope.checkAll = false;
            scope.texts = {
                checkAll: 'Check All',
                uncheckAll: 'Uncheck All',
                selectionCount: 'checked',
                buttonDefaultText: 'Select',
                dynamicButtonTextSuffix: 'checked'
            };

            $(document).bind('click', function (event) {
                var isClickedElementChildOfPopup = element
                        .find(event.target)
                        .length > 0;

                if (isClickedElementChildOfPopup)
                    return;

                scope.$apply(function () {
                    scope.open = false;
                });
            });

            init();

            function init() {
                scope.model = [];
                for (var i = 0; i < scope.options.length; i++) {
                    scope.selectedItems[scope.options[i].id] = true;
                }
                if(scope.selectedModel && scope.selectedModel.length) {
                    for(var i=0; i<scope.selectedModel.length; i++){                        
                        scope.model.push(scope.selectedModel[i].id);
                        scope.selectedItems[scope.selectedModel[i].id] = true;
                    }
                }
            }
            
            scope.toggleDropdown = function () {
                scope.open = !scope.open;
                scope.openState = scope.open;
            };

            scope.openDropDown = function () {
                console.log('hi');
            };

            scope.checkBoxClick = function (id) {
                scope.setSelectedItem(id);
                $event.stopImmediatePropagation();
            };

            scope.checkAllClicked = function () {
                if (scope.checkAll) {
                    selectAll();
                } else {
                    deselectAll();
                }
            };

            function selectAll() {
                scope.model = [];
                scope.selectedItems = {};

                angular.forEach(scope.options, function (option) {
                    scope.model.push(option.groupId);
                });
                angular.forEach(scope.model, function (id) {
                    scope.selectedItems[id] = true;
                });
            };

            function deselectAll() {
                scope.model = [];
                scope.selectedItems = {};
            };

            scope.setSelectedItem = function (id) {
                var filteredArray = [];

                if (scope.selectedItems[id] == true) {
                    scope.model.push(id);
                } else {
                    filteredArray = scope.model.filter(function (value) {
                        return value != id;
                    });
                    scope.model = filteredArray;
                }
                return false;
            };

            scope.getButtonText = function () {
                if ((scope.selectedItems.length > 0 || (angular.isObject(scope.selectedItems) && _.keys(scope.selectedItems).length > 0))) {
                    var totalSelected = angular.isDefined(scope.model) ? scope.model.length : 0;
                    if (totalSelected === 0) {
                        return scope.texts.buttonDefaultText;
                    } else {
                        return totalSelected + ' ' + scope.texts.dynamicButtonTextSuffix;
                    }
                } else {
                    return scope.texts.buttonDefaultText;
                }
            };
        }
    }
});
angular.module('adminPageApp').run(['$templateCache', function($templateCache) {
  'use strict';

  $templateCache.put('views/AddUserModal.html',
    "<div id=\"addUser\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h3 ng-show=\"items.type\" class=\"modal-title\">{{modalTitle}}</h3> <h3 ng-hide=\"items.type\" class=\"modal-title\">Edit an existing user</h3> </div> <div class=\"modal-body\"> <!--Start: Add user from Active directory or from the CSV file --> <div ng-show=\"items.type\"> <div ng-show=\"!(activeDirectoryButton || importFromCSV)\"> <button style=\"width: 200px\" type=\"button\" ng-click=\"addUserFromActiveDirectory()\">Active Directory User</button> <label>Import one or more users from Active Directory</label> <br><br> <button style=\"width: 200px\" type=\"button\" ng-click=\"importUser()\">Import from File</button> <label>Import Users from a CSV file</label> </div> <div ng-show=\"activeDirectoryButton\" class=\"container-fluid updateNews\"> <div class=\"row\"> <div class=\"col-xs-12\"> <h5>Enter Active Directory usernames(NT ids separated by comma)</h5> <textarea row=\"10\" ng-model=\"items.userName\" cols=\"100\"></textarea> </div> </div> <div class=\"row\"> <div class=\"col-xs-4\" ng-hide=\"items.userRole === 'buadmin'\">Insights role</div> <div class=\"col-xs-8\" ng-hide=\"items.userRole === 'buadmin'\"> <select ng-model=\"items.role\" class=\"col-xs-8\"> <option ng-repeat=\"role in roles\">{{role}}</option> </select> </div> </div> <div class=\"row\"> <div class=\"col-xs-4\">Persona</div> <div class=\"col-xs-8\"> <select ng-model=\"items.groupId\" class=\"col-xs-8\"> <option ng-repeat=\"group in groups\" value=\"{{group.groupId}}\">{{group.groupName}}</option> </select> </div> </div> </div> <div ng-show=\"importFromCSV\"> <form name=\"userUploadFile\"> <input type=\"file\" name=\"myfile\" valid-file accept=\".csv\" ng-model=\"myInputFile\" required ng-files=\"getTheFiles($files)\"> <span class=\"error urlValidation\" ng-if=\"userUploadFile.myfile.$touched\" ng-show=\"userUploadFile.myfile.$invalid\"> Only Csv file is supported!</span> </form> <!--a href=\"#\" onclick=\"document.getElementById('fileID').click(); return false;\" />Browse</a --> </div> </div> <!--End of Code for adding user from active directory or from the CSV file --> <!--Start:Code for the edit the existing user --> <div ng-hide=\"items.type\"> <form name=\"userEditForm\"> <div class=\"row\"> <div class=\"col-xs-12\"> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Username</div> <div class=\"col-xs-8\"> {{items.userName}} </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Persona</div> <div class=\"col-xs-8\"> <select ng-model=\"items.groupName\" class=\"col-xs-8\"> <option ng-repeat=\"group in groups\">{{group.groupName}}</option> </select> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Insights role</div> <div class=\"col-xs-8\"> <input type=\"text\" ng-model=\"items.role\" value=\"{{role}}\" readonly ng-show=\"buFlag\"> <select ng-model=\"items.role\" class=\"col-xs-8\" ng-show=\"!buFlag\"> <option ng-repeat=\"role in roles\">{{role}}</option> </select> </div> </div> </div> </div> </form> </div> <!--End of edit user code --> </div> <div class=\"modal-footer\" ng-show=\"(activeDirectoryButton || importFromCSV) || !(items.type) \"> <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"userUploadFile.myfile.$invalid && checkSaveConditions()\" ng-click=\"save(items)\">Save</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"close()\"> Cancel </button> </div> </div>"
  );


  $templateCache.put('views/BICommunicationModal.html',
    "<!DOCTYPE html><!--\r" +
    "\n" +
    "To change this license header, choose License Headers in Project Properties.\r" +
    "\n" +
    "To change this template file, choose Tools | Templates\r" +
    "\n" +
    "and open the template in the editor.\r" +
    "\n" +
    "--><!-- Code for Modal-BICommunication --> <div id=\"BICommunicationModal\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h3 class=\"modal-title\" ng-show=\"items.type\">Add Communication</h3> <h3 class=\"modal-title\" ng-hide=\"items.type\">Update Communication</h3> </div> <div class=\"modal-body\"> <form name=\"CommunicationForm\" novalidate> <div class=\"row\"> <div class=\"col-xs-12\"> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Communication Title</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"communicationTitle\" ng-model=\"items.title\" class=\"col-xs-8\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Persona *</div> <div class=\"col-xs-8\"> <!-- \r" +
    "\n" +
    "                            <select ng-model=\"items.groupId\"  ng-options=\"group.groupId as group.groupName for group in groups\" class=\"col-xs-8\"></select>\r" +
    "\n" +
    "                            --> <!--<select ng-model=\"items.groupId\"  ng-options=\"group.groupId as group.groupName for group in groups\" class=\"col-xs-8\" multiple=\"multiple\"></select>--> <dropdown-multiselect model=\"items.groupIdList\" options=\"groups\" ng-show=\"items.type === 'new'\"></dropdown-multiselect> <input type=\"text\" name=\"communicationGroup\" ng-model=\"items.groupName\" value=\"{{items.groupId}}\" ng-show=\"items.type !== 'new'\" class=\"col-xs-8\" readonly> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\">Communication Link *</div> <div class=\"col-xs-8\"> <input type=\"url\" name=\"communicationLink\" ng-model=\"items.link\" class=\"col-xs-8\" required> <span class=\"error urlValidation\" ng-show=\"CommunicationForm.communicationLink.$error.url\"> Not Valid url!</span> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Details</div> <div class=\"col-xs-8\"> <textarea rows=\"4\" cols=\"50\" ng-model=\"items.details\" name=\"communicationDetails\" class=\"col-xs-8\"></textarea> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Upload Image / Image URL *</div> <div class=\"col-xs-8\"> <input type=\"radio\" ng-model=\"imageMode\" value=\"url\">&nbsp;&nbsp;Image By URL.&nbsp;&nbsp;&nbsp;<input type=\"radio\" ng-model=\"imageMode\" value=\"upload\">&nbsp;&nbsp;Image Upload <br> <input type=\"url\" name=\"communicationImage\" id=\"communicationImageUrl\" ng-model=\"items.image\" class=\"col-xs-8 margin-top-md\" ng-show=\"imageMode === 'url'\" ng-change=\"urlValidate()\"> <span class=\"error urlValidation margin-top-md pull-left\" ng-show=\"CommunicationForm.communicationImage.$error.url && imageMode === 'url'\"> Not Valid url!</span> <input type=\"file\" name=\"myFile\" id=\"myFile\" ng-model=\"myFile\" ng-show=\"imageMode === 'upload'\" accept=\"image/jpeg, image/gif, image/png\" class=\"margin-top-md\" ng-change=\"validateUpload(this.files)\" onchange=\"angular.element(this).scope().validateUpload(this.files)\" ng-files=\"getTheImageFiles($files)\" required> <span ng-show=\"imageMode === 'upload'\"><i>500kb max file size. \"jpg\" and \".png\" only.</i></span><br> <span class=\"error urlValidation\" ng-show=\"imageError && imageMode === 'upload'\">{{imageError}}</span> </div> </div> </div> </div> </form> </div> <div class=\"modal-footer\"> <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"(CommunicationForm.communicationLink.$invalid || (items.type == 'new' &&  items.groupIdList.length < 1) || (!((!!items.image && !CommunicationForm.communicationImage.$error.url) || errorFlag)))\" ng-click=\"save(items)\"> Save</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"close()\">Cancel</button> </div> </div>"
  );


  $templateCache.put('views/BINewsModal.html',
    "<div id=\"BINewsModal\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"cancel()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h3 class=\"modal-title\" ng-show=\"items.type\">Add New News</h3> <h3 class=\"modal-title\" ng-hide=\"items.type\">Edit News</h3> </div> <div class=\"modal-body\"> <form name=\"NewsForm\"> <div class=\"row\"> <div class=\"col-xs-12\"> <div class=\"row updateNews\" ng-hide=\"items.type\"> <div class=\"col-xs-4\"> Created Date</div> <div class=\"col-xs-8\"> <span ng-bind=\"items.createdDate\"></span> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Title</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"title\" ng-model=\"items.title\" class=\"col-xs-8\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Description</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"description\" ng-model=\"items.description\" class=\"col-xs-8\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> URL</div> <div class=\"col-xs-8\"> <input type=\"url\" name=\"newsurl\" ng-model=\"items.url\" class=\"col-xs-8\"> <span class=\"error urlValidation\" ng-show=\"NewsForm.newsurl.$error.url\"> Not Valid url!</span> </div> </div> </div> </div> </form> </div> <div class=\"modal-footer\"> <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"(NewsForm.newsurl.$invalid)||!(!!items.title || !!items.description || !!items.url)\" ng-click=\"save(items)\">Save</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"cancel()\">Cancel</button> </div> </div>"
  );


  $templateCache.put('views/GroupsModal.html',
    "<div id=\"GroupsModal\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h3 class=\"modal-title\" ng-show=\"items.type\">Add New Persona</h3> <h3 class=\"modal-title\" ng-hide=\"items.type\">Edit Persona</h3> </div> <div class=\"modal-body\"> <form name=\"groupForm\"> <div class=\"row\"> <div class=\"col-xs-12\"> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Persona </div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"groupName\" ng-model=\"items.groupName\" class=\"col-xs-8\" ng-readonly=\"(userObject.userinfo.role.toLowerCase() === 'buadmin')? true : false\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Operational Page URL </div> <div class=\"col-xs-8\"> <input type=\"url\" name=\"url\" ng-model=\"items.operationDashboardPage\" class=\"col-xs-8\"> <span class=\"error urlValidation\" ng-show=\"groupForm.url.$error.url\"> Not Valid url!</span> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Help Link Label </div> <div class=\"col-xs-8\"> <input type=\"text\" maxlength=\"20\" name=\"helpLinkLabel\" ng-model=\"items.helpLinkLabel\" class=\"col-xs-8\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Help Link </div> <div class=\"col-xs-8\"> <input type=\"url\" name=\"pageLink\" ng-model=\"items.pageLink\" class=\"col-xs-8\"> <span class=\"error urlValidation\" ng-show=\"groupForm.pageLink.$error.url\"> Not Valid url!</span> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Business Unit </div> <div class=\"col-xs-8\"> <select ng-model=\"items.buGroupId\" ng-options=\"buGroup.buGroupId as buGroup.buGroupName for buGroup in buGroupObj\" ng-hide=\"(userObject.userinfo.role.toLowerCase() === 'buadmin')\"></select> <input type=\"text\" name=\"buGroupName\" ng-model=\"items.buGroupName\" class=\"col-xs-8\" readonly ng-show=\"(userObject.userinfo.role.toLowerCase() === 'buadmin')\"> <input type=\"hidden\" name=\"buGroupId\" ng-model=\"items.buGroupId\"> </div> </div> </div> </div> </form> </div> <div class=\"modal-footer\"> <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"!(!!items.groupName || !!items.operationDashboardPage)||(groupForm.url.$invalid || groupForm.pageLink.$invalid) || !items.buGroupId\" ng-click=\"save(items)\">Save</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"close()\"> Cancel </button> </div> </div>"
  );


  $templateCache.put('views/LevelModal.html',
    "<div id=\"LevelsModal\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h3 class=\"modal-title\" ng-show=\"items.type\">Add New Level</h3> <h3 class=\"modal-titled\" ng-hide=\"items.type\">Edit Level</h3> </div> <div class=\"modal-body\"> <form name=\"levelForm\"> <div class=\"row\"> <div class=\"col-xs-12\"> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Level Name </div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"levelName\" ng-model=\"items.levelDesc\" class=\"col-xs-8\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-8 col-xs-offset-4\"> <label> <input type=\"radio\" name=\"levelFlag\" value=\"Parent\" ng-model=\"levelFlag\" ng-click=\"selectLevelType('Parent')\" ng-checked=\"true\"> Is Parent </label> <label> <input type=\"radio\" name=\"levelFlag\" value=\"Child\" ng-model=\"levelFlag\" ng-click=\"selectLevelType('Child')\"> Is Child Of </label> </div> </div> <div class=\"row updateNews\" ng-show=\"levelFlag === 'Child'\"> <div class=\"col-xs-4\"> Parent Level Name </div> <div class=\"col-xs-8\"> <select ng-model=\"items.parentLevelId\" ng-options=\"level.levelId as level.levelDesc for level in parentLevelList\" ng-change=\"getChildLevels()\" class=\"col-xs-8\"></select> </div> </div> <div class=\"row updateNews\" ng-show=\"childLevelList.length > 0 && levelFlag === 'Child'\"> <div class=\"col-xs-4\"> Child Level Name </div> <div class=\"col-xs-8\"> <select ng-model=\"items.childLevelId\" ng-options=\"level.levelId as level.levelDesc for level in childLevelList\" class=\"col-xs-8\"></select> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Persona </div> <div class=\"col-xs-8\"> <dropdown-multiselect model=\"items.selectedGroupIdList\" options=\"groupIdList\" selected-model=\"selectedGroupIds\" ng-if=\"groupIdList\"></dropdown-multiselect> </div> </div> </div> </div> </form> </div> <div class=\"modal-footer\"> <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"!items.levelDesc\" ng-click=\"save(items)\">Save</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"close()\"> Cancel </button> </div> </div>"
  );


  $templateCache.put('views/NotificationModal.html',
    "<div id=\"BINewsModal\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"cancel()\" aria-label=\"Close\"> <span aria-hidden=\"true\">&times;</span> </button> <h3 class=\"modal-title\" ng-show=\"items.type\">Add New Notification</h3> <h3 class=\"modal-title\" ng-hide=\"items.type\">Edit Notification</h3> </div> <div class=\"modal-body\"> <form name=\"NotificationForm\"> <div class=\"row\"> <div class=\"col-xs-12\"> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Persona *</div> <div class=\"col-xs-8\"> <!--<dropdown-multiselect model=\"items.selectedGroupIdList\" options=\"groupIdList\" selected-model=\"selectedGroupIds\" ng-if=\"groupIdList\"></dropdown-multiselect>--> <select ng-options=\"group.groupId as group.groupName for group in groupIdList\" ng-model=\"items.groupId\" required> <option value=\"\">Select</option> </select> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Header *</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"header\" ng-model=\"items.header\" class=\"col-xs-8\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Message Body *</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"messageBody\" ng-model=\"items.messageBody\" class=\"col-xs-8\"> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Notification Type</div> <div class=\"col-xs-8\"> <select ng-model=\"items.notificationType\"> <option value=\"A\">Alert</option> <option value=\"M\">Message</option> <option value=\"T\">Task</option> </select> </div> </div> <div class=\"row updateNews\"> <div class=\"col-xs-4\"> Is Active</div> <div class=\"col-xs-8 notification-radio\"> <input type=\"radio\" ng-model=\"items.isActive\" value=\"Y\" checked>Active <input class=\"inactive\" type=\"radio\" ng-model=\"items.isActive\" value=\"N\">In Active </div> </div> </div> </div> </form> </div> <div class=\"modal-footer\"> <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"!items.header || !items.messageBody || !items.groupId\" ng-click=\"save(items)\">Save</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"cancel()\">Cancel</button> </div> </div>"
  );


  $templateCache.put('views/Tabs.html',
    "<ul class=\"nav nav-pills\"> <li class=\"active\"> <a href=\"#\">Update Fields</a> </li> <li><a href=\"#\">Report Visibility</a></li> </ul>"
  );


  $templateCache.put('views/UIGrid.html',
    "<button type=\"button\" ng-click=\"open()\" ng-hide=\"state.current.name === 'administration.list.groups' && userObject.userinfo.role.toLowerCase() === 'buadmin'\">Add</button> <span class=\"pull-right\" ng-show=\"state.current.name === 'administration.list.users'\"> <a target=\"_self\" class=\"btn btn-sm btn-info\" href=\"{{downloadLink}}\" download=\"UserReport.csv\">Download</a> </span> <span class=\"text-success\">{{messageAlert}}</span> <span class=\"text-danger\">{{messageAlertError}}</span> <br> <span ui-view=\"audit\"></span> <br> <div id=\"grid3\" ui-grid-infinite-scroll ui-grid=\"myData\" class=\"grid\"></div>"
  );


  $templateCache.put('views/about.html',
    "<div class=\"container-fluid\"> <span class=\"col-xs-12 text-right download-button\" ng-show=\"displayType==='Deployed'\"> <a target=\"_self\" class=\"btn btn-sm btn-info\" href=\"{{downloadEntDeployedReport}}\" download=\"DeployedReport.csv\">Download</a> </span> <div class=\"col-xs-12\"> <div id=\"grid1\" ui-grid=\"myData\" ui-grid-edit ui-grid-selection ui-grid-infinite-scroll class=\"grid\"></div> </div> </div>"
  );


  $templateCache.put('views/adminDropdown.html',
    "<!--<div class=\"ui-grid-cell-contents\">\r" +
    "\n" +
    "  <div dropdown dropdown-append-to-body class=\"btn-group\" >\r" +
    "\n" +
    "    <button type=\"button\" ng-disabled=\"grid.appScope.userObject.userinfo.role.toLowerCase() === 'buadmin' && grid.appScope.checkRoleForOption(row.entity)\" class=\"btn btn-xs btn-primary dropdown-toggle\" dropdown-toggle>\r" +
    "\n" +
    "      Options<span class=\"caret\"></span>\r" +
    "\n" +
    "    </button>\r" +
    "\n" +
    "    <ul class=\"dropdown-menu\" role=\"menu\">\r" +
    "\n" +
    "        <li ng-hide=\"grid.appScope.state.current.name !== 'administration.list.users' || grid.appScope.checkRole(row.entity) || grid.appScope.userObject.userinfo.role.toLowerCase() !== 'admin'\"><a ng-click=grid.appScope.updateMemberShip(row.entity)>BU Persona Membership</a>\r" +
    "\n" +
    "        <li><a ng-click=grid.appScope.open(row.entity)> Edit </a></li>\r" +
    "\n" +
    "        <li ng-hide=\"(grid.appScope.state.current.name === 'administration.list.users' || grid.appScope.state.current.name === 'administration.list.groups') && grid.appScope.userObject.userinfo.role.toLowerCase() === 'buadmin'\"><a  ng-click=grid.appScope.deleteItems(row.entity)>Delete</a></li>\r" +
    "\n" +
    "  </ul>\r" +
    "\n" +
    "  </div>\r" +
    "\n" +
    "</div>--> <div class=\"ui-grid-cell-contents\"> <div class=\"row-options\"> <span ng-hide=\"grid.appScope.state.current.name !== 'administration.list.users' || grid.appScope.checkRole(row.entity) || grid.appScope.userObject.userinfo.role.toLowerCase() !== 'admin'\"> <a ng-click=\"grid.appScope.updateMemberShip(row.entity)\" title=\"BU Persona Membership\"><span class=\"glyphicon glyphicon-user\" aria-hidden=\"true\"></span></a> </span> <span> <a ng-click=\"grid.appScope.open(row.entity)\" title=\"Edit\"><span class=\"glyphicon glyphicon-pencil\" aria-hidden=\"true\"></span></a> </span> <span ng-hide=\"(grid.appScope.state.current.name === 'administration.list.users' || grid.appScope.state.current.name === 'administration.list.groups') && grid.appScope.userObject.userinfo.role.toLowerCase() === 'buadmin'\"> <a ng-click=\"grid.appScope.deleteItems(row.entity)\" title=\"Delete\"><span class=\"glyphicon glyphicon-trash\" aria-hidden=\"true\"></span></a> </span> </div> </div>"
  );


  $templateCache.put('views/auditFilters.html',
    "<div class=\"row\"> <div class=\"col-md-2\"> <label>From Date</label> </div> <div class=\"col-md-2\"> <label>To Date</label> </div> </div> <div class=\"row calendarBlock\"> <div class=\"col-md-2\"> <p class=\"input-group\"> <input type=\"text\" class=\"form-control\" uib-datepicker-popup=\"{{format}}\" ng-model=\"popup1.dt\" is-open=\"popup1.opened\" show-weeks=\"false\" min-date=\"popup1.minDate\" max-date=\"popup1.maxDate\" datepicker-options=\"dateOptions\" ng-required=\"true\" close-text=\"Close\"> <span class=\"input-group-btn\"> <button type=\"button\" class=\"btn btn-default\" ng-click=\"open1($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button> </span> </p> </div> <div class=\"col-md-2\"> <p class=\"input-group\"> <input type=\"text\" class=\"form-control\" uib-datepicker-popup=\"{{format}}\" ng-model=\"popup2.dt\" is-open=\"popup2.opened\" show-weeks=\"false\" min-date=\"popup1.dt\" max-date=\"popup2.maxDate\" datepicker-options=\"dateOptions\" ng-required=\"true\" close-text=\"Close\"> <span class=\"input-group-btn\"> <button type=\"button\" class=\"btn btn-default\" ng-click=\"open2($event)\"><i class=\"glyphicon glyphicon-calendar\"></i></button> </span> </p> </div> <div class=\"col-md-2\"> <p class=\"input-group\"> <button type=\"button\" class=\"btn btn-sm btn-info\" ng-disabled=\"!popup1.dt || !popup2.dt\" ng-click=\"filterAudit()\">Filter</button> </p> </div> <div class=\"col-md-2 col-md-offset-4\"> <p class=\"input-group\"> <a target=\"_self\" class=\"btn btn-sm btn-info\" href=\"{{downloadLink}}{{searchTextValue}}&searchGroupId={{searchGroupValue}}&searchFromDate={{popup1.dt | date:'yyyy-MM-dd'}} 00:00:00&searchToDate={{popup2.dt | date:'yyyy-MM-dd'}} 23:59:59\" download=\"audit-report.csv\" ng-disabled=\"myData.data.length==0\">Download</a> </p> </div> </div> <div id=\"grid3\" ui-grid-infinite-scroll ui-grid=\"myData\" class=\"grid\"></div>"
  );


  $templateCache.put('views/deleteModal.html',
    "<div id=\"deleteModal\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"cancel()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h3 class=\"modal-title\">Delete</h3> </div> <div class=\"modal-body\"> <p>{{message}}</p> </div> <div class=\"modal-footer\"> <button class=\"btn btn-danger\" type=\"button\" ng-click=\"delete(items.data.id)\">Delete</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"cancel()\">Cancel</button> </div> </div>"
  );


  $templateCache.put('views/external.html',
    "<div class=\"container-fluid\"> <span class=\"col-xs-12 text-right download-button\" ng-show=\"displayType==='Deployed'\"> <a target=\"_self\" class=\"btn btn-sm btn-info\" href=\"{{downloadExtDeployedReport}}\" download=\"DeployedReport.csv\">Download</a> </span> <div class=\"col-xs-12\"> <div id=\"grid1\" ui-grid=\"myData\" ui-grid-edit ui-grid-selection ui-grid-infinite-scroll class=\"grid\"></div> </div> </div>"
  );


  $templateCache.put('views/main.html',
    ""
  );


  $templateCache.put('views/manageExternal.html',
    "<div class=\"container-fluid\"> <div class=\"row\"> <div class=\"col-md-12\"> <span class=\"text-success\">{{messageAlert}}</span> <span class=\"text-danger\">{{messageAlertError}}</span> </div> </div> <div class=\"row margin-top-md\" ng-show=\"displayForm == 'edit'\"> <div class=\"container-fluid padding-zero\"> <div class=\"col-xs-12 margin-top-md\"> <div id=\"grid1\" ui-grid=\"myData\" ui-grid-edit ui-grid-selection ui-grid-infinite-scroll class=\"grid\"></div> </div> </div> </div> <div class=\"row\" ng-show=\"displayForm == 'add'\"> <form class=\"form-horizontal margin-top-md\" name=\"externalReport\" novalidate autocomplete=\"off\"> <div class=\"form-group\"> <label for=\"reportName\" class=\"col-sm-2 control-label\">Report Name * : </label> <div class=\"col-sm-6\"> <input type=\"text\" name=\"reportName\" class=\"form-control\" ng-model=\"external.reportName\" ng-class=\"{'has-error' :externalReport.reportName.$invalid && externalReport.reportName.$pristine }\" required> <!--<p ng-show=\"externalReport.reportName.$error\"></p>--> </div> </div> <div class=\"form-group\"> <label for=\"reportDesc\" class=\"col-sm-2 control-label\">Report Description :</label> <div class=\"col-sm-6\"> <input type=\"text\" name=\"reportDesc\" class=\"form-control\" ng-model=\"external.reportDesc\" ng-class=\"{'has-error' :externalReport.reportDesc.$invalid && externalReport.reportDesc.$pristine }\"> </div> </div> <div class=\"form-group\"> <label for=\"reportLink\" class=\"col-sm-2 control-label\">Report Link * :</label> <div class=\"col-sm-6\"> <input type=\"text\" name=\"reportLink\" class=\"form-control\" ng-model=\"external.reportLink\" ng-class=\"{'has-error' :externalReport.reportLink.$invalid && externalReport.reportLink.$pristine && urlValid}\" ng-change=\"validateUrl(external.reportLink)\" required> <p class=\"error urlValidation\" ng-show=\"!externalReport.reportLink.$pristine && !urlValid\">Invalid URL</p> </div> </div> <div class=\"form-group\"> <label for=\"functionalArea\" class=\"col-sm-2 control-label\">Functional Area :</label> <div class=\"col-sm-6\"> <input type=\"text\" name=\"functionalArea\" class=\"form-control\" ng-model=\"external.functionalArea\" ng-class=\"{'has-error' :externalReport.functionalArea.$invalid && externalReport.functionalArea.$pristine }\"> </div> </div> <div class=\"form-group\"> <label for=\"linkTitle\" class=\"col-sm-2 control-label\">Link Title :</label> <div class=\"col-sm-6\"> <input type=\"text\" name=\"linkTitle\" class=\"form-control\" ng-model=\"external.linkTitle\" ng-class=\"{'has-error' :externalReport.linkTitle.$invalid && externalReport.linkTitle.$pristine }\"> </div> </div> <div class=\"form-group\"> <label for=\"linkHoverInfo\" class=\"col-sm-2 control-label\">Link Hover Info :</label> <div class=\"col-sm-6\"> <input type=\"text\" name=\"linkHoverInfo\" class=\"form-control\" ng-model=\"external.linkHoverInfo\" ng-class=\"{'has-error' :externalReport.linkHoverInfo.$invalid && externalReport.linkHoverInfo.$pristine }\"> </div> </div> <div class=\"form-group\"> <label for=\"displayType\" class=\"col-sm-2 control-label\">Is Embedded :</label> <div class=\"col-sm-6 isembeded\"> <input type=\"radio\" name=\"displayType\" class=\"\" ng-model=\"external.displayType\" value=\"Y\">&nbsp;&nbsp;Yes&nbsp;&nbsp;&nbsp;&nbsp; <input type=\"radio\" name=\"displayType\" class=\"\" ng-model=\"external.displayType\" value=\"N\">&nbsp;&nbsp;No </div> </div> <div class=\"form-group\"> <label for=\"additionalInfo\" class=\"col-sm-2 control-label additional-info\">Tile Color : <a href=\"javascript:void(0)\" class=\"glyphicon glyphicon-question-sign font-Iconsize\" popover-animation=\"true\" uib-popover=\"{{popAdditionalInfo.content}}\" popover-placement=\"{{popAdditionalInfo.placement}}\" popover-class=\"{{popAdditionalInfo.class}}\" popover-trigger=\"focus\"></a> </label> <div class=\"col-sm-6\"> <color-picker ng-model=\"external.additionalInfo\" color-picker-format=\"'hex'\" color-picker-on-change=\"onSelectAColor($event, color)\"></color-picker> <!--<input type=\"text\" name=\"additionalInfo\" class=\"form-control\" ng-model=\"external.additionalInfo\" ng-class=\"{'has-error' :externalReport.additionalInfo.$invalid && externalReport.additionalInfo.$pristine }\">--> </div> </div> <div class=\"form-group\"> <div class=\"col-sm-offset-4 col-sm-8\"> <button name=\"add\" class=\"btn btn-info\" type=\"submit\" ng-disabled=\"externalReport.$invalid || !urlValid\" ng-click=\"addExternal(external)\">Add Report</button> <button name=\"clear\" class=\"btn btn-warning\" type=\"button\" ng-click=\"clearForm();\">Reset</button> </div> </div> </form> </div> </div>"
  );


  $templateCache.put('views/modal.html',
    "<div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"cancel()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <button class=\"btn btn-primary save\" type=\"button\" ng-disabled=\"progress || !items.reportName\" ng-click=\"ok()\" ng-hide=\"items.id && exFlag && updatefields\"> {{(!exFlag)? 'Save' : (items.id && exFlag && !updatefields)? 'Save': 'Add to Portal'}} </button> <!--Code for Nav Tabs--> <ul class=\"nav nav-pills\"> <li ng-class=\"{'active':updatefields}\"> <a href=\"javascript:void(0);\" ng-click=\"tabchange(true)\"> {{(exFlag) ? 'Report Details' : 'Update Report'}} </a> </li> <li ng-class=\"{'active':!updatefields}\"> <a href=\"javascript:void(0);\" ng-click=\"tabchange(false)\"> Report Visibility </a> </li> </ul> <!--End of Code for Nav Tabs--> </div> <!-- Code for Tab1--> <div class=\"modal-body\"> <span class=\"text-success\">{{saveText}}</span> <form name=\"reportForm\" ng-show=\"updatefields\" class=\"report-modal-form\"> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Created Date</div> <div class=\"col-xs-8\"> {{items.createdDate}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Updated Date </div> <div class=\"col-xs-6\">{{items.updatedDate}} </div> </div> </div> </div> <!--End of row1--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\" ng-hide=\"exFlag\"> Owner</div> <div class=\"col-xs-4\" ng-show=\"exFlag\"> Created By</div> <div class=\"col-xs-8\">{{items.owner}}</div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> System Description </div> <div class=\"col-xs-8\">{{ items.systemDescription}} </div> </div> </div> </div> <!--End of row2--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Source System</div> <div class=\"col-xs-8\"> {{items.sourceSystem}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Name </div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"reportName\" ng-model=\"items.reportName\" ng-hide=\"exFlag\"> <p ng-show=\"exFlag\">{{items.reportName}}</p> </div> </div> </div> </div> <!--End of row4--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Source Report Id</div> <div class=\"col-xs-8\"> {{items.sourceReportId}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Description </div> <div class=\"col-xs-8\"> <textarea name=\"reportDesc\" ng-model=\"items.reportDesc\" ng-hide=\"exFlag\">{{items.reportDesc}}</textarea> <p ng-show=\"exFlag\">{{items.reportDesc | limitTo:100}}<span ng-show=\"items.reportDesc.length > 100\">...</span></p> </div> </div> </div> </div> <!--End of row5--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Type</div> <div class=\"col-xs-6\"> {{items.reportType}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\" ng-hide=\"exFlag\"> Additional Information </div> <div class=\"col-xs-4\" ng-show=\"exFlag\"> Tile Color </div> <div class=\"col-xs-6\"> {{items.additionalInfo}} </div> </div> </div> </div> <!--End of row6--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Link </div> <div class=\"col-xs-8\" style=\"word-wrap: break-word\"> {{items.reportLink}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\" ng-hide=\"exFlag\"> <div class=\"col-xs-4\"> View Count </div> <div class=\"col-xs-8\"> {{items.viewCount}} </div> </div> <div class=\"row\" ng-show=\"exFlag\"> <div class=\"col-xs-4\"> Is Embedded </div> <div class=\"col-xs-8\"> {{(items.displayType == 'N')? 'No': 'Yes'}} </div> </div> </div> </div> <!--End of row7--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Functional Area</div> <div class=\"col-xs-8\"> {{items.functionalArea}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\" ng-hide=\"exFlag\"> <div class=\"col-xs-4\"> Refresh Status </div> <div class=\"col-xs-8\"> <select ng-model=\"items.refreshStatus\"> <option value=\"N\">N</option> <option value=\"Y\">Y</option> </select> </div> </div> </div> </div> <!--End of row8--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Link Title</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"titleLink\" ng-model=\"items.linkTitle\" ng-hide=\"exFlag\"> <p ng-show=\"exFlag\">{{items.linkTitle}}</p> </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\" ng-hide=\"exFlag\"> <div class=\"col-xs-4\"> View Tabs </div> <div class=\"col-xs-8\"> <select ng-model=\"items.tabbedViews\"> <option value=\"N\">N</option> <option value=\"Y\">Y</option> </select> </div> </div> </div> </div> <!--End of row9--> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Link Hover Information</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"linkHoverInfo\" ng-model=\"items.linkHoverInfo\" ng-hide=\"exFlag\"> <p ng-show=\"exFlag\">{{items.linkHoverInfo}}</p> </div> </div> </div> <div class=\"col-md-6\"> <div class=\"row\" ng-hide=\"exFlag\"> <div class=\"col-xs-4\">Toolbar Position </div> <div class=\"col-xs-8\"> <select ng-model=\"items.displayType\"> <option value=\"B\">Bottom</option> <option value=\"T\">Top</option> <option value=\"H\">Hide</option> </select> </div> </div> </div> </div> <div class=\"row\" ng-hide=\"exFlag\"> <div class=\"col-md-6\" ng-show=\"headerFlag\"> <div class=\"row\"> <div class=\"col-xs-4\"> Header Flag</div> <div class=\"col-xs-8\"> <select ng-model=\"isHeaderVal\"> <option value=\"1\">Show</option> <option value=\"0\">Hide</option> </select> </div> </div> </div> <div class=\"col-md-6\"></div> </div> </form> <!-- Code for Tab2--> <form ng-hide=\"updatefields\" style=\"margin-left: 30px\"> <div> <b>Permissions</b> - Reports to give access </div> <hr> <div class=\"row\"> <div class=\"col-xs-3\">Set Level</div> <div class=\"col-xs-3\">Select Persona</div> </div> <hr> <div class=\"row\" ng-repeat=\"levelGroupMap in levelGroupMaps\"> <div class=\"col-xs-3\"> <select ng-model=\"levelGroupMap.selectedlevel\" ng-options=\"level.levelId as level.levelDesc  for level in levelGroup.allLevels\"></select> </div> <div class=\"col-xs-3\"> <select ng-model=\"levelGroupMap.selectedgroup\" ng-options=\"group.groupId as group.groupName for group in levelGroup.allGroups\"></select> </div> <div class=\"col-xs-6\" style=\"margin-bottom: 10px\"> <button class=\"btn\" type=\"button\" ng-click=\"addLevelGroup()\">+Add</button> <button class=\"btn\" type=\"button\" ng-click=\"removeLevelGroup($index)\">-Remove</button> </div> </div> <br> </form> <!-- End of Code for Tab2--> </div> <!-- End of Code for Tab2--> <div class=\"modal-footer\"> <!--<span class=\"text-success\">{{saveText}}</span>--> <!--    <button class=\"btn btn-primary save\" type=\"button\" ng-disabled=\"progress\" ng-click=\"ok()\">Save</button>\r" +
    "\n" +
    "    <button class=\"btn btn-warning\" type=\"button\" ng-click=\"cancel()\">Cancel</button>--> </div>"
  );


  $templateCache.put('views/modalExternal.html',
    "<div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"cancel()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <button class=\"btn btn-primary save\" type=\"button\" ng-disabled=\"progress || !items.reportName\" ng-click=\"ok()\">Save</button> <h3 class=\"modal-title\">External Reports</h3> </div> <div class=\"modal-body\"> <span class=\"text-success\">{{saveText}}</span> <form name=\"reportForm\" class=\"report-modal-form\"> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Created Date</div> <div class=\"col-xs-8\"> {{items.createdDate}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Updated Date </div> <div class=\"col-xs-6\">{{items.updatedDate}} </div> </div> </div> </div> <!--End of row1--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Created By</div> <div class=\"col-xs-8\">{{items.owner}}</div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> System Description </div> <div class=\"col-xs-8\">{{ items.systemDescription}} </div> </div> </div> </div> <!--End of row2--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Source System</div> <div class=\"col-xs-8\"> <!--input type=\"text\" name=\"sourceSystem\" ng-model=\"items.sourceSystem\" readonly--> {{items.sourceSystem}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Name </div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"reportName\" ng-model=\"items.reportName\"> </div> </div> </div> </div> <!--End of row4--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Source Report Id</div> <div class=\"col-xs-8\"> <!-- input type=\"text\" name=\"sourceReport\" ng-model=\"items.sourceReportId\" --> {{items.sourceReportId}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Description </div> <div class=\"col-xs-8\"> <textarea name=\"reportDesc\" ng-model=\"items.reportDesc\">{{items.reportDesc}}</textarea> <!--<input type=\"text\" name=\"reportDesc\" ng-model=\"items.reportDesc\" ng-readonly=\"exFlag\">--> </div> </div> </div> </div> <!--End of row5--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Type</div> <div class=\"col-xs-6\"> <!-- input type=\"text\" name=\"reportType\" ng-model=\"items.reportType\" --> {{items.reportType}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Tile Color </div> <div class=\"col-xs-6\"> <input type=\"text\" name=\"additionalInfo\" ng-model=\"items.additionalInfo\"> </div> </div> </div> </div> <!--End of row6--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Report Link </div> <div class=\"col-xs-8\" style=\"word-wrap: break-word\"> <input type=\"text\" name=\"reportLink\" ng-model=\"items.reportLink\"> </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> View Count </div> <div class=\"col-xs-8\"> <!-- input type=\"text\" name=\"viewCount\" ng-model=\"items.viewCount\" --> {{items.viewCount}} </div> </div> </div> </div> <!--End of row7--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Functional Area</div> <div class=\"col-xs-8\"> <!-- input type=\"text\" name=\"functionalArea\" ng-model=\"items.functionalArea\" --> {{items.functionalArea}} </div> </div> </div> <div class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Is Embedded </div> <div class=\"col-xs-8\"> <select ng-model=\"items.displayType\"> <option value=\"N\">No</option> <option value=\"Y\">Yes</option> </select> </div> </div> </div> </div> <!--End of row8--> <div class=\"row\"> <div style=\"\" class=\"col-xs-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Link Title</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"titleLink\" ng-model=\"items.linkTitle\"> </div> </div> </div> <div class=\"col-xs-6\"></div> </div> <!--End of row9--> <div class=\"row\"> <div class=\"col-md-6\"> <div class=\"row\"> <div class=\"col-xs-4\"> Link Hover Information</div> <div class=\"col-xs-8\"> <input type=\"text\" name=\"linkHoverInfo\" ng-model=\"items.linkHoverInfo\"> </div> </div> </div> <div class=\"col-md-6\"></div> </div> </form> </div> <!--End of row10   --> <div class=\"modal-footer\"> <!--<span class=\"text-success\">{{saveText}}</span>\r" +
    "\n" +
    "    <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"progress\" ng-click=\"ok()\">Save</button>\r" +
    "\n" +
    "    <button class=\"btn btn-warning\" type=\"button\" ng-click=\"cancel()\">Cancel</button>--> </div>"
  );


  $templateCache.put('views/notAuth.html',
    "<div class=\"middle-box text-center animated fadeInRightBig\"> <h3 class=\"font-bold\">User - Not Authorized</h3> <div class=\"error-desc\"> We are sorry, but you are not authorized to access this page. Please contact us <a href=\"mailto:insights.portal.help@emc.com\">here</a> for requesting access. <br><a href=\"../\" class=\"btn btn-primary m-t\">Home</a> </div> </div>"
  );


  $templateCache.put('views/recommendedSelect.html',
    "<div class=\"container-fluid\"> <div class=\"row\"> <span class=\"col-xs-offset-4 col-xs-12 font-bold text-warning\" ng-show=\"maxSelected\">Recommended Reports selection count has reached the max limit of {{recommendedCount}}</span> </div> <div class=\"row\"> <div class=\"col-xs-6\"> <div id=\"grid1\" ui-grid=\"myData1\" ui-grid-edit ui-grid-selection ui-grid-infinite-scroll class=\"grid\"> </div> </div> <div class=\"col-xs-1\" style=\"text-align: center; top : 100px\"> <button type=\"button\" class=\"btn btn-circle glyphicon glyphicon-chevron-right\" ng-click=\"selectedReport()\" ng-disabled=\"!selected\"></button><br> <button type=\"button\" class=\"btn btn-circle glyphicon glyphicon-chevron-left\" ng-click=\"deSelectedReport()\" ng-disabled=\"!deSelected\"></button> </div> <div class=\"col-xs-5\"> <div id=\"grid2\" ui-grid=\"myData2\" ui-grid-edit ui-grid-selection ui-grid-infinite-scroll class=\"grid\" style=\"height: 250px\"></div> <div class=\"row\"> <div class=\"col-xs-12 margin-top-md\"> <button type=\"button\" class=\"\" ng-click=\"move(true)\" ng-disabled=\"!selectedMove\">Move First</button> <button type=\"clear\" class=\"\" ng-click=\"moveUpDown(true)\" ng-disabled=\"!selectedMove\">Move Up</button> <button type=\"button\" class=\"\" ng-click=\"moveUpDown(false)\" ng-disabled=\"!selectedMove\">Move Down</button> <button type=\"clear\" class=\"\" ng-click=\"move(false)\" ng-disabled=\"!selectedMove\">Move Last</button> </div> </div> <div class=\"row\"> <div class=\"col-xs-offset-8 col-xs-12 margin-top-md\"> <button type=\"button\" class=\"btn btn-primary\" ng-click=\"updateRecommendedReport();\" ng-disabled=\"progress\">Save</button> <button type=\"clear\" class=\"btn btn-warning\" ng-click=\"cancelSelectedReport();\">Cancel</button> </div> <span class=\"col-xs-offset-4 col-xs-12 text-success ng-binding\">{{saveText}}</span> </div> </div> </div> </div>"
  );


  $templateCache.put('views/updateMemberShip.html',
    "<div id=\"addUser\"> <div class=\"modal-header\"> <button type=\"button\" class=\"close\" ng-click=\"close()\" aria-label=\"Close\"><span aria-hidden=\"true\">&times;</span></button> <h3 class=\"modal-title\">BU Persona Membership</h3> </div> <div class=\"modal-body\"> <!--Start: Add user from Active directory or from the CSV file --> <div class=\"container-fluid\"> <div class=\"col-xs-12\"> Assign Persona's to User \"{{userName}}\" </div> <div class=\"col-xs-12\"> <input type=\"text\" class=\"col-xs-12\" ng-model=\"searchGroup\" placeholder=\"Search Groups\"> </div> <div class=\"col-xs-12\"> <div class=\"table-responsive\"> <table class=\"table\"> <thead> <tr> <th></th> <th>Persona</th> <th>Member Count</th> </tr> </thead> <tbody> <tr ng-repeat=\"group in groupsArray | filter: {groupName : searchGroup}\"> <td><input type=\"checkbox\" ng-checked=\"exists(group.groupId, selected)\" ng-click=\"toggle(group.groupId, selected)\"></td> <td>{{group.groupName}}</td> <td>{{group.userCount}}</td> </tr> </tbody> </table> </div> </div> </div> <!--End of Code for adding user from active directory or from the CSV file --> <!--End of edit user code --> </div> <div class=\"modal-footer\"> <button class=\"btn btn-primary\" type=\"button\" ng-disabled=\"!selected.length\" ng-click=\"save()\">Save</button> <button class=\"btn btn-warning\" type=\"button\" ng-click=\"close()\"> Cancel </button> </div> </div>"
  );

}]);
