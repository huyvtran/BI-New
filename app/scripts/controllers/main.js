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
    $scope.$emit('setNavBar', true);
    $scope.myInterval = 6000;
    $scope.noWrapSlides = false;
    $scope.carouselData = [];
    $scope.activeTab = 0;
    $scope.personaInfo = {};
    $scope.ieFlag = true;
    $scope.winFocus = false;
    $scope.listViewStatus = false;
    $scope.isRecommendedCollapsed = true;
    $scope.isFavoriteCollapsed = true;
    $scope.isMostViewedCollapsed = true;
    
    var newHeight, scrollBar;

    if($window.innerWidth < 768) {
        newHeight = 66;
        scrollBar = true;
    } else if ($window.innerWidth < 992) {
        newHeight = 75;
        scrollBar = true;
    } else {
        newHeight = 200;
        scrollBar = false;
    }
    
    $scope.config = {
        autoHideScrollbar: scrollBar,
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: newHeight,
        scrollInertia: 0
    };
    
    $scope.hideNavBar = function() {
        ($scope.noNavBar) ? $scope.noNavBar = false: $scope.noNavBar = true;
    };
    
    $scope.$on('bredCrumbValue', function(event, value){
        $scope.pageBreadCrumb = value
    });
    
    $scope.$on('myLevelIndication', function(event, value){
        $scope.myLevel = $localStorage.myLevel;
    });
    
    $scope.$on('myThemeSettings', function(event, theme, personalization){
        $localStorage.userTheme = theme;
        $localStorage.personalization = personalization;
        $scope.userTheme = $localStorage.userTheme;
    });
    
    $scope.$on('setSearchDisplayName', function(event, value){
        $scope.searchDisplayName = value;
    });
    
    $scope.$on('addToFavorite', function(event, obj) {
        var panelName = obj.arrayItem.title;
        var favStatus = obj.favorite;
        var  reportIndex = obj.reportIndex;
        
        switch(panelName) {
            case 'Favorite Reports': 
                obj.arrayItem.data.splice(reportIndex, 1);
                changeToFavorite(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id}), $scope.panelMostViewedReports.data, 'N');
                changeToFavorite(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id}), $scope.panelRRReports.data, 'N');
                break;
                
            case 'Most Viewed Reports':
                if(favStatus === 'N') {
//                    ($scope.panelFavoriteReports.data.length < 5) ? $scope.panelFavoriteReports.data.push(obj.report): '';
                    $scope.panelFavoriteReports.data.push(obj.report);
                    changeToFavorite(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id}), $scope.panelRRReports.data, 'Y');
                } else {
                    (_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}) >  -1) ? 
                        $scope.panelFavoriteReports.data.splice(_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}), 1): '';
                    changeToFavorite(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id}), $scope.panelRRReports.data, 'N');
                }    
                break;
                
            case 'Recommended Reports':
                if(favStatus === 'N') {
//                    ($scope.panelFavoriteReports.data.length < 5) ? $scope.panelFavoriteReports.data.push(obj.report): '';
                    $scope.panelFavoriteReports.data.push(obj.report);
                    changeToFavorite(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id}), $scope.panelMostViewedReports.data, 'Y');
                } else {
                    (_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}) >  -1) ? 
                        $scope.panelFavoriteReports.data.splice(_.findLastIndex($scope.panelFavoriteReports.data, {'id' : obj.report.id}), 1): '';          
                    changeToFavorite(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id}), $scope.panelMostViewedReports.data, 'N');
                } 
                break;
        }
    });
    
    function changeToFavorite(itemIndex, itemArray, itemFlag) {
        if(itemIndex && itemArray[itemIndex]) {
            itemArray[itemIndex].favorite = itemFlag;
        }
//        if(_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id})) {
//            $scope.panelMostViewedReports.data[_.findLastIndex($scope.panelMostViewedReports.data, {'id' : obj.report.id})].favorite = 'N';
//        }
//        if(_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id})) {
//            $scope.panelRRReports.data[_.findLastIndex($scope.panelRRReports.data, {'id' : obj.report.id})].favorite = 'N';
//        }
    }
    
    $scope.panelMostViewedReports = {
        'title': 'Most Viewed Reports',
        'open': true,
        'limit': 5,
        'class_names': 'report-block report-tile'
    };

    $scope.panelRRReports = {
        'title': 'Recommended Reports',
        'open': true,
        'limit': 5,
        'class_names': 'report-block report-tile',
        'viewMoreUiLink': 'reports.list',
        'rr': true
    };

    $scope.panelFavoriteReports = {
        'title': 'Favorite Reports',
        'open': true,
        'limit': 5,
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
        setUserCustomization($scope.reportPriorityList, 'tileSettings');
    };

    $scope.setLoading(true);
    
    $scope.setListView = function (status) {
        $scope.listViewStatus  = status;
        $localStorage.listViewStatus = status;
        $scope.$broadcast('listViewValue', status);
        
        for (var i in $scope.reportPanelList) {
            $scope.reportPanelList[i]['listView'] = status;
        }
        var value = (status === true) ? 1 : 0;
        setUserCustomization(value, 'listView');
    }

    $scope.refreshPanelList = function () {
        $scope.reportPanelList = [];
        var totalPriorities = $scope.reportPriorityList.length;
        
        for (var i = 0; i < totalPriorities; i++) {
            switch ($scope.reportPriorityList[i]) {
                case 'recentViewedReports':
                    $scope.panelRRReports.listView = $scope.listViewStatus;
                    $scope.panelRRReports.open = $scope.isRecommendedCollapsed;
                    $scope.panelRRReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelRRReports);
                    break;
                case 'favoriteReports':
                    $scope.panelFavoriteReports.listView = $scope.listViewStatus;
                    $scope.panelFavoriteReports.open = $scope.isFavoriteCollapsed;
                    $scope.panelFavoriteReports.indexData = {'curr': i, 'total': totalPriorities};
                    $scope.reportPanelList.push($scope.panelFavoriteReports);
                    break;
                case 'mostViewedReports':
                    $scope.panelMostViewedReports.listView = $scope.listViewStatus;
                    $scope.panelMostViewedReports.open = $scope.isMostViewedCollapsed;
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
//        $scope.panelMostViewedReports.data = (response[0].mostViewedReports.length > $scope.panelMostViewedReports.limit) ? (response[0].mostViewedReports.splice(0, $scope.panelMostViewedReports.limit)) : response[0].mostViewedReports;
//        $scope.panelFavoriteReports.totalRecord = response[0].favoriteReports.length;
//        $scope.panelFavoriteReports.data = (response[0].favoriteReports.length > $scope.panelFavoriteReports.limit) ? (response[0].favoriteReports.splice(0, $scope.panelFavoriteReports.limit)) : response[0].favoriteReports;
//        $scope.panelRRReports.data = (response[0].recentViewedReports.length > $scope.panelRRReports.limit) ? (response[0].recentViewedReports.splice(0, $scope.panelRRReports.limit)) : response[0].recentViewedReports;
        $scope.panelMostViewedReports.data = response[0].mostViewedReports;
        $scope.panelFavoriteReports.data = response[0].favoriteReports;
        $scope.panelRRReports.data = response[0].recentViewedReports;
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
    
    function setUserCustomization(reportObject, type) {
        switch(type) {
            case 'tileSettings':
                userDetailsService.userPromise.then(function(userObj) {
                    var putObj = {
                        'userId' : userObj[0].uid,
                        'recommended' :reportObject.indexOf('recentViewedReports')+1,
                        'favorite' : reportObject.indexOf('favoriteReports')+1,
                        'mostViewed' : reportObject.indexOf('mostViewedReports')+1,
                        'userTheme' : findThemeKey(CONFIG.userTheme, $localStorage.userTheme)
                    };
                    
                    $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                        .then(function (resp, status, headers) {

                        }, function (resp, status, headers, config) {

                        });
                });
                break;
            case 'listView':
                userDetailsService.userPromise.then(function(userObj) {
                    var putObj = {
                        'userId' : userObj[0].uid,
                        'isListViewed' :reportObject,
                    };
                    
                    $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                        .then(function (resp, status, headers) {

                        }, function (resp, status, headers, config) {

                        });
                });
                break;
        }   
        
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
                (response.data.isListViewed === 0 || response.data.isListViewed === null || !response.data.isListViewed) ? $localStorage.listViewStatus = false : $localStorage.listViewStatus = true;
                (response.data.isRecommendedCollapsed === 1) ? $scope.isRecommendedCollapsed = false : $scope.isRecommendedCollapsed = true;
                (response.data.isFavoriteCollapsed === 1) ? $scope.isFavoriteCollapsed = false : $scope.isFavoriteCollapsed = true;
                (response.data.isMostViewedCollapsed === 1) ? $scope.isMostViewedCollapsed = false : $scope.isMostViewedCollapsed = true;
                var personalization = [];
                
                if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                    personalization[response.data.favorite - 1] = 'favoriteReports'; 
                    personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                    personalization[response.data.recommended - 1] = 'recentViewedReports';
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                }
                
                $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                $scope.listViewStatus = $localStorage.listViewStatus;
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
                $scope.listViewStatus = $localStorage.listViewStatus = false;
                $scope.userTheme = $localStorage.userTheme;
                $scope.$emit('myThemeSettings', $scope.userTheme, $scope.reportPriorityList);
            }
        });
    }
});