'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ProfileCtrl', function ($scope, $localStorage, userDetailsService, commonService, CONFIG, $http, $timeout, reportsMenu) {
    $scope.setLoading(true);
    $scope.$emit('setNavBar', true);
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    if(!$scope.userObject) {
        userDetailsService.userPromise.then(function (response) {
            $scope.setLoading(false);
            $scope.userObject = response[0];
            $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
            setUserLevel($scope.userObject);
            setUserPreference();
        });
    } else {
        setUserLevel($scope.userObject);
        setUserPreference();
        $scope.setLoading(false);
    }
    
    function setUserLevel(usrObj) {
        if(!$localStorage.myLevel) {
            if (usrObj.userinfo.badge === 'Bronze') {
                $scope.myLevel = 'bronze-level';
            } else if (usrObj.userinfo.badge === 'Silver') {
                $scope.myLevel = 'silver-level';
            } else if (usrObj.userinfo.badge === 'Gold') {
                $scope.myLevel = 'gold-level';
            } else if (usrObj.userinfo.badge === 'Platinum') {
                $scope.myLevel = 'platinum-level';
            }

            $scope.userBadgeImage = "images/"+$scope.myLevel+"-badge.png";
            $localStorage.myLevel = $scope.myLevel
            $scope.$emit('myLevelIndication', $scope.myLevel);
        } else {
            $scope.myLevel = $localStorage.myLevel;
            $scope.userBadgeImage = "images/"+$scope.myLevel+"-badge.png";
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
    
    $scope.setUserTheme = function(theme) {
        if($localStorage.userTheme === theme) {
            return;
        }
        
        $scope.setLoading(true);
        var reportPriorityList = $localStorage.personalization
        var putObj = {
            'userTheme' : findThemeKey(CONFIG.userTheme, theme)
        }
        
        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
            .then(function (resp, status, headers) {
                $localStorage.userTheme = theme;
                $scope.userTheme = $localStorage.userTheme;
                $scope.$emit('myThemeSettings', $localStorage.userTheme, $localStorage.personalization, $localStorage.isMenuCollapsed);
            }, function (resp, status, headers, config) {
            });
        $scope.setLoading(false);    
    };
    
    function findThemeKey(obj, value) {
        var key;
        
        _.each(_.keys(obj), function(k) {
           if(obj[k] === value) {
               key = k;
           } 
        });
        return parseInt(key);
    }
});