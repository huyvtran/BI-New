'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:tilesPageCtrl
 * @description
 * # tilesPageCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('searchReportController', ['$scope', 'popularSearchService', '$timeout', function ($scope, popularSearchService, $timeout) {
    $scope.model = {
        isMinimised: true,
        searchCloud: '',
        searchFilterOptions: [{name: 'Report Name', id: 'searchTextReportName'}, {name: 'Report Description', id: 'searchTextReportDesc'}, {name: 'Functional Area', id: 'searchTextFunctionalArea'}, {name: 'Owner', id: 'searchTextOwner'}]
    };
    
    $scope.searchFilter = '';
    
    $scope.isCloudVisible = false;

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
                $scope.isCloudVisible = true;
            }, 1);
        } else {
            $scope.isCloudVisible = false;
        }
    });

    $scope.minimize = function () {
        $scope.model.isMinimised = true;
    }
}]);