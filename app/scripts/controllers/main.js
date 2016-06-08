'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myBiApp 
 */
angular.module('myBiApp')
.controller('MainCtrl', function ($scope, newsService, reportSummaryService, $q, carouselService, popularSearchService, $http, commonService, reportsFactory, userDetailsService, $window, $timeout) {
    $scope.myInterval = 6000;
    $scope.noWrapSlides = false;
    $scope.carouselData = [];
    $scope.activeTab = 0;
    $scope.personaInfo = {};
    $scope.ieFlag = true;
    $scope.winFocus = false;
    //$scope.badge = '0%';
    
    /**
     *Update my level indication
     */
//    $scope.badgePercentage = {
//        'Bronze': '25%',
//        'Silver': '50%',
//        'Gold': '75%',
//        'Platinum': '100%'
//    };

    $scope.config = {
        autoHideScrollbar: false,
        theme: 'light',
        advanced: {
            updateOnContentResize: true
        },
        setHeight: 150,
        scrollInertia: 0
    };

    $scope.panelMostViewedReports = {
        'title': 'Most Viewed Reports',
        'open': true,
        'limit': 6,
        'class_names': 'report-tile'
    };

    $scope.panelRRReports = {
        'title': 'Recommended Reports',
        'open': true,
        'limit': 6,
        'class_names': 'report-tile',
        'viewMoreUiLink': 'reports.list',
        'rr': true
    };

    $scope.panelFavoriteReports = {
        'title': 'Favorite Reports',
        'open': true,
        'limit': 6,
        'class_names': 'report-tile',
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

        /**
         * Update my level indication
         */
        //$scope.badge = $scope.badgePercentage[response[5][0].userinfo.badge];
        //console.log($scope.badge);
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
        console.log(reportPriorityList);

        userDetailsService.userPromise.then(function(userObj) {
            var putObj = {
                'userId' : userObj[0].emcLoginName,
                'recommended' :reportPriorityList.indexOf('recentViewedReports')+1,
                'favorite' : reportPriorityList.indexOf('favoriteReports')+1,
                'mostViewed' : reportPriorityList.indexOf('mostViewedReports')+1,
                'userTheme' : 0
            }
            console.log(putObj);

            $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
                .then(function (resp, status, headers) {
                    console.log(resp);
                }, function (resp, status, headers, config) {
                    console.log(resp);
                });
        });
    }
    
    function setPersonalization() {
        $http.get('BITool/home/getUserPersonalization').then(function (response) {
            if(response.data) {
                var personalization = [];
                personalization[response.data.favorite - 1] = 'favoriteReports'; 
                personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                personalization[response.data.recommended - 1] = 'recentViewedReports';
                console.log(personalization);
                $scope.reportPriorityList = personalization;
                $scope.reportPanelList = [];
                $scope.refreshPanelList($scope.reportPriorityList);
            } else {
                $scope.reportPriorityList = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                $scope.reportPanelList = [];
            }
        });
    }
});