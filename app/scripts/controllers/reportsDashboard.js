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
    
    setUserPreference();
    setUserLevel();
    
    function setUserLevel() {
        if(!$localStorage.myLevel) {
            console.log('Operational IF - No Localstorage level');
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
            console.log('Operational ELSE - Yes Localstorage level');
            $scope.myLevel = $localStorage.myLevel;
            $scope.$emit('myLevelIndication', $scope.myLevel);
        }
    }
    
    function setUserPreference() {
        var personalization = [];
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            console.log('Operational IF - No Localstorage theme');
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
            console.log('Operational ELSE - Yes Localstorage theme');
            $scope.userTheme = $localStorage.userTheme;
            personalization = $localStorage.personalization;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
});
