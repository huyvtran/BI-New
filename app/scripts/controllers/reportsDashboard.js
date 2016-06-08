'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportsdashboardCtrl
 * @description
 * # ReportsdashboardCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportsdashboardCtrl', function ($scope, reportsMenu) {
    reportsMenu.all().then(function () {
        $scope.operationDashboardLink = reportsMenu.operationalLink;
    });
});
