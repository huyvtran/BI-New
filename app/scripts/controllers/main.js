'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myBiApp 
 */
angular.module('myBiApp')
.controller('MainCtrl', function ($scope, $rootScope, $localStorage, newsService, reportSummaryService, $q, carouselService, popularSearchService, $http, commonService, reportsFactory, userDetailsService, $window, $timeout, CONFIG) {
    $scope.myInterval = 6000;
    $scope.noWrapSlides = false;
    $scope.carouselData = [];
    $scope.activeTab = 0;
    $scope.personaInfo = {};
    $scope.ieFlag = true;
    $scope.winFocus = false;
    
    $scope.config = {
        autoHideScrollbar: false,
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 200,
        scrollInertia: 0
    };
    
    $scope.$on('bredCrumValue', function(event, value){
        $scope.pageBreadCrum = value
    });
    
    $scope.$on('myLevelIndication', function(event, value){
        $scope.myLevel = $localStorage.myLevel;
    });
    
    $scope.$on('myThemeSettings', function(event, theme, personalization){
        $localStorage.userTheme = theme;
        $localStorage.personalization = personalization;
        $scope.userTheme = $localStorage.userTheme;
    });
    
    $scope.panelMostViewedReports = {
        'title': 'Most Viewed Reports',
        'open': true,
        'limit': 6,
        'class_names': 'report-block report-tile'
    };

    $scope.panelRRReports = {
        'title': 'Recommended Reports',
        'open': true,
        'limit': 6,
        'class_names': 'report-block report-tile',
        'viewMoreUiLink': 'reports.list',
        'rr': true
    };

    $scope.panelFavoriteReports = {
        'title': 'Favorite Reports',
        'open': true,
        'limit': 6,
        'class_names': 'report-block report-tile',
        'viewMoreUiLink': 'favorites'
    };
    
    setPersonalization();
    
    $scope.onMovePanelTo = function (currPosition, increment) {
        var currItem = $scope.reportPriorityList[currPosition];
        var newPos = currPosition + increment;
        $scope.reportPriorityList.splice(currPosition, 1);
        $scope.reportPriorityList.splice(newPos, 0, currItem);
        $scope.refreshPanelList($scope.reportPriorityList);
        setUserCustomization($scope.reportPriorityList);
    };

    $scope.setLoading(true);
    $scope.setListView = function (status) {
        for (var i in $scope.reportPanelList) {
            $scope.reportPanelList[i]['listView'] = status;
        }
    }

    $scope.refreshPanelList = function () {
        $scope.reportPanelList = [];
        var totalPriorities = $scope.reportPriorityList.length;
        for (var i = 0; i < totalPriorities; i++) {
            switch ($scope.reportPriorityList[i]) {
                case 'recentViewedReports':
                    $scope.panelRRReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelRRReports);
                    break;
                case 'favoriteReports':
                    $scope.panelFavoriteReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelFavoriteReports);
                    break;
                case 'mostViewedReports':
                    $scope.panelMostViewedReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelMostViewedReports);
                    break;
            }
        }
    };

    $q.all([reportSummaryService.getReportSummary(), newsService, carouselService, popularSearchService, $scope.biGroup.all(), userDetailsService.userPromise]).then(function (response) {
        $scope.personaInfo = response[5][0].personaInfo;
        $scope.setLoading(false);
        $scope.newsData = response[1];
        $scope.panelMostViewedReports.data = (response[0].mostViewedReports.length > $scope.panelMostViewedReports.limit) ? (response[0].mostViewedReports.splice(0, $scope.panelMostViewedReports.limit)) : response[0].mostViewedReports;
        $scope.panelFavoriteReports.data = (response[0].favoriteReports.length > $scope.panelFavoriteReports.limit) ? (response[0].favoriteReports.splice(0, $scope.panelFavoriteReports.limit)) : response[0].favoriteReports;
        $scope.panelRRReports.data = (response[0].recentViewedReports.length > $scope.panelRRReports.limit) ? (response[0].recentViewedReports.splice(0, $scope.panelRRReports.limit)) : response[0].recentViewedReports;
        $scope.panelMostViewedReports.listView = false;
        $scope.panelFavoriteReports.listView = false;
        $scope.panelRRReports.listView = false;
        $scope.refreshPanelList();
        $scope.carouselData = response[2];
        $scope.words = response[3];
    
        var userdetails = response[5][0];
        
        if (userdetails.userinfo.badge === 'Bronze') {
            $scope.myLevel = 'bronze-level';
        } else if (userdetails.userinfo.badge === 'Silver') {
            $scope.myLevel = 'silver-level';
        } else if (userdetails.userinfo.badge === 'Gold') {
            $scope.myLevel = 'gold-level';
        } else if (userdetails.userinfo.badge === 'Platinum') {
            $scope.myLevel = 'platinum-level';
        }
        $localStorage.myLevel = $scope.myLevel;
        $scope.$emit('myLevelIndication', $scope.myLevel);
    });

    $scope.showMyIndication = false;
    $scope.collapseMyIndication = function () {
        $scope.showMyIndication = !$scope.showMyIndication;
    };

    $scope.showMostviewed = true;
    $scope.collapseMostviewed = function () {
        $scope.showMostviewed = !$scope.showMostviewed;
    };

    $scope.showTopSerches = true;
    $scope.collapseTopSerches = function () {
        $scope.showTopSerches = !$scope.showTopSerches;
    };

    $scope.showMyUtilization = true;
    $scope.collapseMyUtilization = function () {
        $scope.showMyUtilization = !$scope.showMyUtilization;
    };

    $scope.showMyActivity = true;
    $scope.collapseMyActivity = function () {
        $scope.showMyActivity = !$scope.showMyActivity;
    };

    $scope.showBadges = true;
    $scope.collapseBadges = function () {
        $scope.showBadges = !$scope.showBadges;
    };

    $window.onfocus = function () {
        $scope.winFocus = true;
    };

    $scope.triggerCarousel = function () {
        //location.reload();
        if ($scope.winFocus) {
            $scope.ieFlag = false;
            $timeout(function () {
                $scope.ieFlag = true;
            }, 1000);
            $scope.winFocus = false;
        }
    };
    
    function setUserCustomization(reportPriorityList) {
        userDetailsService.userPromise.then(function(userObj) {
            var putObj = {
                'userId' : userObj[0].uid,
                'recommended' :reportPriorityList.indexOf('recentViewedReports')+1,
                'favorite' : reportPriorityList.indexOf('favoriteReports')+1,
                'mostViewed' : reportPriorityList.indexOf('mostViewedReports')+1,
                'userTheme' : findThemeKey(CONFIG.userTheme, $localStorage.userTheme)
            }
            $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                .then(function (resp, status, headers) {
                    
                }, function (resp, status, headers, config) {
                
                });
        });
    }
    
    function findThemeKey(obj, value) {
        var key;
        
        _.each(_.keys(obj), function(k) {
           if(obj[k] === value) {
               key = k;
           } 
        });
        return parseInt(key);
    }
    
    function setPersonalization() {
        $http.get('BITool/home/getUserPersonalization').then(function (response) {
            if(response.data) {
                var personalization = [];
                personalization[response.data.favorite - 1] = 'favoriteReports'; 
                personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                personalization[response.data.recommended - 1] = 'recentViewedReports';
                
                $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                $scope.userTheme = $localStorage.userTheme;
                $localStorage.personalization = personalization;
                $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                $scope.reportPriorityList = personalization;
                $scope.reportPanelList = [];
                $scope.refreshPanelList($scope.reportPriorityList);
            } else {
                $scope.reportPriorityList = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                $scope.reportPanelList = [];
                $localStorage.userTheme = 'default';
                $scope.userTheme = $localStorage.userTheme;
                $scope.$emit('myThemeSettings', $scope.userTheme, $scope.reportPriorityList);
            }
        });
    }
});