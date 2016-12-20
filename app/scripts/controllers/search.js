'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:SearchCtrl
 * @description
 * # SearchCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('SearchCtrl', function ($scope, $stateParams, reportsFactory, CONFIG, userDetailsService, $localStorage) {
    //subcaption for subheader
    $scope.mainState.$current.data.subCaption = $stateParams.searchText;
    $scope.groupsData = {};
//    $scope.setListView = function (status) {
//        if ($scope.groupsData) {
//            $scope.groupsData.service['listView'] = status;
//        }
//    }
    
    function doSearch(text) {
        var searchfilter = ($stateParams.searchfilter && $stateParams.searchfilter.filter)? $stateParams.searchfilter.filter : '';
        var groupService = new reportsFactory.reportsFactoryFunction('search', text, $stateParams.persona, searchfilter);
        $scope.setLoading(false);
        /*groupService.loadReports().then(function(){
         });
         groupService.loadmoredisable = true;*/
        $scope.groupsData = {
            'title': 'Search',
            'open': true,
            'limit': undefined,
            'class_names': 'col-xs-12',
            'loadmoredisable': groupService.loadmoredisable,
            'service': groupService,
            'data': groupService.reports/*,
             'searchTypePersona' : $stateParams.persona*/
        };
    }
    
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
    
    $scope.setLoading(true);
    doSearch($stateParams.searchText);
    setUserPreference();
    setUserLevel();
});