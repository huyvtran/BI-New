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
    $scope.$emit('bredCrumbValue', '');
    $scope.$emit('setNavBar', true);
    $scope.sortOption = 'ascName';
    $scope.filterOption = 'filter';
    $scope.defaultFilter = 'All';
    
    $scope.$on('listViewValue', function(event, status) {
        $localStorage.listViewStatus = status;
        $scope.listViewStatus = $localStorage.listViewStatus;
    });
    
    $scope.$on('menuCollapsedStatus', function(event, status) {
        $localStorage.isMenuCollapsed = status;
        $scope.isMenuCollapsed = $localStorage.isMenuCollapsed;
    });
    
    setUserPreference();
    
    $scope.sortReports = function() {
        $scope.$broadcast('sortFilterReportsBroadCast', $scope.sortOption, $scope.filterOption, 'sort');
    }
    
    $scope.filterReports = function() {
        $scope.defaultFilter = 'All';  
        $scope.$broadcast('sortFilterReportsBroadCast', $scope.sortOption, $scope.filterOption, 'filter');
    }
    
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
    
    $scope.setListView = function (status) {
        if ($scope.myfavorites) {
            $scope.myfavorites.listView = status;
            //$scope.groupsData['listView']=status;
            updateListView(status);
        }
        
        if (!$scope.dataObj) {
            return;
        } else {
            for (var i in $scope.dataObj) {
                $scope.dataObj[i].listView = status;
                updateListView(status);
            }
        }
    }
    
    function updateListView(status) {
        $scope.$broadcast('listViewValue', status);
        var value = (status === 'grid') ? 0 :((status === 'list') ? 1 :  2);
        var putObj = {
            'isListViewed' :value,
        };

        $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
            .then(function (resp, status, headers) {

            }, function (resp, status, headers, config) {

            });
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
    
    function sortList(list, filter) {
        if(filter === 'asc_name') {
            return _.sortBy(list, 'name');
        } else if(filter === 'des_name'){
            return _.sortBy(list, 'name').reverse();
        } else if(filter === 'asc_date'){
            return _.sortBy(list, 'createDate');
        } else {
            return _.sortBy(list, 'createDate').reverse();
        }
    }
    
//    $scope.setListView(false);
});