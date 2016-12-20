'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:tilesPageCtrl
 * @description
 * # tilesPageCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('searchReportController', ['$scope', 'popularSearchService', '$timeout', '$window', function ($scope, popularSearchService, $timeout, $window) {
        
    $scope.model = {
        isMinimised: true,
        searchCloud: '',
        searchFilterOptions: [{name: 'Report Name', id: 'searchTextReportName'}, {name: 'Report Description', id: 'searchTextReportDesc'}, {name: 'Functional Area', id: 'searchTextFunctionalArea'}, {name: 'Owner', id: 'searchTextOwner'}]
    };
//    $scope.noNavBar = true;
    $scope.searchFilter = '';
    $scope.isCloudVisible = false;
    $scope.showIcon = false;
    
    $scope.showIconFlag = function() {
        ($scope.searchText) ? $scope.showIcon = true : $scope.showIcon = false; 
    };
    
    $scope.openSearch = function() {
        $scope.$emit('hideNotfy', false);
        if($scope.model.isMinimised) {
            $scope.model.isMinimised = false;
        } else {
            $scope.model.isMinimised = true;
        }
    };
    
    $scope.GetDataWithHtml = function () {
        console.log('hi');
    };
    
    $scope.clearText = function() {
        $scope.showIcon = false;
        $scope.searchText = "";
        angular.element('.globle-search-input').focus();
    };
    
    popularSearchService.then(function (r) {
        $scope.model.searchCloud = r;
        $scope.isCloudVisible = true;
        $timeout(function () {
            $scope.isCloudVisible = false;
        }, 1);
    });

    $scope.$watch('model.isMinimised', function (o, n) {
        if (n) {
            $timeout(function () {
                angular.element('.globle-search-input').focus();
                $scope.isCloudVisible = true;
            }, 1);
        } else {
            $scope.isCloudVisible = false;
        }
    });
}]);