'use strict';

/**
 * @ngdoc overview
 * @name myBiApp
 * @description
 * # myBiApp
 *
 */
angular.module("myBiApp").directive("searchReport", function () {
    return {
        templateUrl: "views/searchReport.html",
        restrict: "E",
        controller: "searchReportController"
    }
});