'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:SearchdetailsCtrl
 * @description
 * # SearchdetailsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('SearchdetailsCtrl', function ($scope, $rootScope, $stateParams, $state, searchservice, CONFIG, userDetailsService, $localStorage, commonService, $http) {
    $scope.feedbackArray = [];
    $scope.reportAccessData = {};
    $scope.isCollapsed = false;
    setUserPreference();
    setUserLevel();
    $scope.$emit('setNavBar', true);
    
    if ($stateParams.sourceReportId) {

        //$scope.mainState.$current.data.displayName = $rootScope.searchObject.reportName;
        //Update search Id in headerCrtl
        /**
         * To update the tab urls with report id.
         * TODO: without passing searchid also.. this functionality would work as expected.
         */
        $scope.updateSearchId($stateParams.searchId);
        if ($state.current.name === 'search.details.report') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }

                $http.get(urlReports).then(function (resp) {
                    //Update user view count
                    var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl(response[0].emcLoginName, resp.data.sourceReportId, resp.data.sourceSystem, 'Search');
                    $http.get(reportUpdateViewed);

                    $scope.mainState.$current.data.displayName = resp.data.name;
                    $rootScope.searchReportName = resp.data.name;
                    $scope.$emit('setSearchDisplayName', $rootScope.searchReportName);
                    
                    $scope.isTableu = true;
                    var placeholderDiv = document.getElementById('tableu_report3');
                    //placeholderDiv.setAttribute('fixT',Math.random());
                    var url = resp.data.reportLink ? resp.data.reportLink : '';
                    var options = {
                        hideTabs: (resp.data.tabbedViews && resp.data.tabbedViews === 'Y') ? true : false,
                        width: '100%',
                        height: '800px'
                    };
                    new tableau.Viz(placeholderDiv, url, options);
                });
            });
            //TODO Remove isTableu from template for showing iframe or grid or d3 reports.

        } else if ($state.current.name === 'search.details.about') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }
                
                $http.get(urlReports).then(function (resp) {
                    $scope.reportData = resp.data;
                    $scope.mainState.$current.data.displayName = resp.data.name;
                    $rootScope.searchReportName = resp.data.name;
                    $scope.$emit('setSearchDisplayName', $rootScope.searchReportName);
                });
            });
        } else if ($state.current.name === 'search.details.access') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }
                if(!$rootScope.searchReportName) {
                    $http.get(urlReports).then(function (resp) {
                        $scope.mainState.$current.data.displayName = resp.data.name;
                        $scope.$emit('setSearchDisplayName', resp.data.name);
                    });
                } else {
                    $scope.mainState.$current.data.displayName = $rootScope.searchReportName;
                    $scope.$emit('setSearchDisplayName', $rootScope.searchReportName);
                }
                
                searchservice.loadReportAccess($stateParams.sourceReportId, $stateParams.sourceName, $stateParams.searchId, $stateParams.persona).then(function (resp) {
                    $scope.reportAccessData = resp;
                    $scope.mainState.$current.data.displayName = resp.data.name;
                    $scope.$emit('setSearchDisplayName', resp.data.name);
                });
            });    
        } else if ($state.current.name === 'search.details.feedback') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }

                if(!$rootScope.searchReportName) {
                    $http.get(urlReports).then(function (resp) {
                        $scope.mainState.$current.data.displayName = resp.data.name;
                        $scope.$emit('setSearchDisplayName', resp.data.name);
                    });
                } else {
                    $scope.mainState.$current.data.displayName = $rootScope.searchReportName;
                    $scope.$emit('setSearchDisplayName', $rootScope.searchReportName);
                }
                
                $scope.feedbackArray = [];
                searchservice.loadFeedbacks($stateParams.searchId).then(function (resp) {
                    $scope.feedbackArray = resp;
                });
            });    
        }
    }

    $scope.feedback = '';
    
    $scope.postFeedback = function () {
        if ($scope.feedback.trim() !== '') {
            $scope.setLoading(true);
            searchservice.postFeedback($stateParams.searchId, $scope.feedback).then(function (/*feedObj*/) {
                $scope.feedback = '';
                searchservice.loadFeedbacks($stateParams.searchId).then(function (resp) {
                    $scope.setLoading(false);
                    $scope.feedbackArray = resp;
                }, function () {
                    $scope.setLoading(false);
                });
            }, function () {
                $scope.setLoading(false);
            });
        }
    };
    
    function setUserLevel() {
        if(!$localStorage.myLevel) {
            userDetailsService.userPromise.then(function (userObject) {
                if (userObject[0].userinfo.badge === 'Bronze') {
                    $scope.myLevel = 'bronze-level';
                } else if (userObject[0].userinfo.badge === 'Silver') {
                    $scope.myLevel = 'silver-level';
                } else if (userObject[0].userinfo.badge === 'Gold') {
                    $scope.myLevel = 'gold-level';
                } else if (userObject[0].userinfo.badge === 'Platinum') {
                    $scope.myLevel = 'platinum-level';
                }

                $localStorage.myLevel = $scope.myLevel
                $scope.$emit('myLevelIndication', $scope.myLevel);
            });    
        } else {
            $scope.myLevel = $localStorage.myLevel;
            $scope.$emit('myLevelIndication', $scope.myLevel);
        }
    }
    
    function setUserPreference() {
        var personalization = [];
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            $scope.setLoading(true);
            $http.get('BITool/home/getUserPersonalization').then(function (response) {
                if(response.data) {
                    personalization[response.data.favorite - 1] = 'favoriteReports'; 
                    personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                    personalization[response.data.recommended - 1] = 'recentViewedReports';

                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $scope.userTheme = $localStorage.userTheme;
                    $localStorage.personalization = personalization;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                } else {
                    $localStorage.userTheme = 'default';
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $scope.userTheme = $localStorage.userTheme;
                    $localStorage.personalization = personalization;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                }
            });
            $scope.setLoading(false);
        } else {
            $scope.userTheme = $localStorage.userTheme;
            personalization = $localStorage.personalization;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
});
