'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportsdashboardCtrl
 * @description
 * # ReportsdashboardCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportsdashboardCtrl', function ($scope, reportsMenu, $http, CONFIG, userDetailsService, $localStorage) {
    reportsMenu.all().then(function () {
        $scope.operationDashboardLink = reportsMenu.operationalLink;
    });
    
    $scope.$emit('bredCrumbValue', '');
    $scope.$emit('setNavBar', true);
    setUserPreference();
    setUserLevel();
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
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
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }
                    
                    if (response.data.isListViewed === null || !response.data.isListViewed) {
                        $localStorage.listViewStatus = 'grid';
                    } else {
                        (response.data.isListViewed === 0) ? $localStorage.listViewStatus = 'grid' : ((response.data.isListViewed === 1)? $localStorage.listViewStatus = 'list': $localStorage.listViewStatus = 'detailed');
                    }
                    
                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $localStorage.personalization = personalization;
                    $localStorage.isMenuCollapsed = (response.data.isMenuCollapsed === 1) ? true : false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $scope.userTheme = $localStorage.userTheme = 'default';                    
                    $scope.listViewStatus = $localStorage.listViewStatus = 'grid';
                    $scope.isMenuCollapsed = $localStorage.isMenuCollapsed = 0;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus
            $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization, $scope.isMenuCollapsed);
        }
    }
});
