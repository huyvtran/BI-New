'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ProfileCtrl
 * @description
 * # ProfileCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('HelpSupportCtrl', function ($scope, $localStorage, userDetailsService, commonService, CONFIG, $http) {
    $scope.setLoading(true);
    $scope.$emit('setNavBar', true);
    
    if(!$scope.userObject) {
        userDetailsService.userPromise.then(function (response) {
            $scope.setLoading(false);
            $scope.userObject = response[0];
            $scope.userPicUrl = commonService.prepareUserProfilePicUrl($scope.userObject.uid);
            var userdetails = $scope.userObject;
            setUserLevel($scope.userObject);
            setUserPreference();
        });
    } else {
        var userdetails = $scope.userObject;
        setUserLevel(userdetails);
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
            $http.get('BITool/home/getUserPersonalization').then(function (response) {
                if(response.data) {
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }

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
        } else {
            $scope.userTheme = $localStorage.userTheme;
            personalization = $localStorage.personalization;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
    
    $scope.setUserTheme = function(theme) {
        if($localStorage.userTheme === theme) {
            return;
        }
        $scope.setLoading(true);
        var reportPriorityList = $localStorage.personalization
        var putObj = {
            'userId' : $scope.userObject.uid,
            'recommended' :reportPriorityList.indexOf('recentViewedReports')+1,
            'favorite' : reportPriorityList.indexOf('favoriteReports')+1,
            'mostViewed' : reportPriorityList.indexOf('mostViewedReports')+1,
            'userTheme' : findThemeKey(CONFIG.userTheme, theme)
        }
        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
            .then(function (resp, status, headers) {
                $localStorage.userTheme = theme;
                $scope.userTheme = $localStorage.userTheme;
                $scope.$emit('myThemeSettings', $localStorage.userTheme, reportPriorityList);
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