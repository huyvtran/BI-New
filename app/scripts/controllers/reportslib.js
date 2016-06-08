'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportslibCtrl
 * @description
 * # ReportsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportslibCtrl', function ($scope, $uibModalInstance, items) {
    //$scope.setLoading(false);
    $scope.items = items;

    $scope.selected = {
        item: $scope.items[0]
    };

    $scope.ok = function () {
        angular.forEach($scope.items, function (value) {
            var idx = $scope.selection.indexOf(value.id);
            if (idx > -1) {
                value.publish = true;
                value.lastp = getCurrentTime();
            }
        });
        $uibModalInstance.close($scope.items);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.selection = [];

    $scope.toggleSelection = function (reportid) {
        var idx = $scope.selection.indexOf(reportid);

        // is currently selected
        if (idx > -1) {
            $scope.selection.splice(idx, 1);
        }

        // is newly selected
        else {
            $scope.selection.push(reportid);
        }
    };

    $scope.selectAll = function () {
        angular.forEach($scope.items, function (value) {
            $scope.selection.push(value.id);
        });
    };

    $scope.deSelectAll = function () {
        $scope.selection.splice(0, $scope.selection.length);
    };

    function getCurrentTime() {
        return new Date().getTime();
    }

    $scope.totalItems = 64;
    $scope.currentPage = 1;

    $scope.setPage = function (pageNo) {
        $scope.currentPage = pageNo;
    };

    $scope.pageChanged = function () {
    };

    $scope.maxSize = 10;
    $scope.bigTotalItems = 175;
    $scope.bigCurrentPage = 1;
});