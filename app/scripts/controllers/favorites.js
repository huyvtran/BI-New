'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the myBiApp. Controls the favorite page.
 */
angular.module('myBiApp')
.controller('favoritesCtrl', function ($scope, $localStorage, reportsFactory, userDetailsService, $http, CONFIG) {
    var favoriteService = new reportsFactory.reportsFactoryFunction('favorite');
//    $scope.pageBreadCrumb = '<a href="#/">Home</a>  -> My Favorites';
    $scope.$emit('bredCrumbValue', '');
    $scope.$emit('setNavBar', true);
    
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
    
    setUserPreference();
    
    $scope.setListView = function (status) {
        if ($scope.myfavorites) {
            $scope.myfavorites.listView = status;
            //$scope.groupsData['listView']=status;
        }
        
        if (!$scope.dataObj) {
            return;
        } else {
            for (var i in $scope.dataObj) {
                $scope.dataObj[i].listView = status;
            }
        }
    }

    $scope.myfavorites = {
        'title': 'My Favorites',
        'open': true,
        'limit': undefined,
        'class_names': 'col-lg-2 col-md-4 col-sm-4 col-xs-6 report-tile',
        'loadmoredisable': favoriteService.loadmoredisable,
        'service': favoriteService,
        'data': favoriteService.reports,
        'listView' : $scope.listViewStatus
    };
    
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
                    $localStorage.personalization = personalization;
                    (response.data.isListViewed === 0 || response.data.isListViewed === null || !response.data.isListViewed) ? $localStorage.listViewStatus = false : $localStorage.listViewStatus = true;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $localStorage.userTheme = 'default';
                    $localStorage.listViewStatus = false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
    
//    $scope.setListView(false);
});