'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportCtrl
 * @description
 * # ReportCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportCtrl', function ($scope, $http, $stateParams, $state, $sce, reportsMenu, userDetailsService, commonService, searchservice/*, $rootScope*/) {
    /*jshint latedef: false */
    $scope.setLoading(false);
    $scope.isTableu = false;
    $scope.tableuLink = '';
    $scope.feedbackArray = [];
    $scope.reportAccessData = {};

    $scope.getTableuLink = function () {
        return $sce.trustAsResourceUrl($scope.tableuLink);
    };

    if ($stateParams.levelId && $stateParams.reportId) {

        if ($state.current.name === 'reports.details.report.report') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.reportId);
                $http.get(urlReports).then(function (resp) {

                    //Update user view count
                    var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl(response[0].emcLoginName, resp.data.sourceReportId, resp.data.sourceSystem, 'Persona');
                    $http.get(reportUpdateViewed);

                    if (resp.data.name) {
                        $scope.reportName = resp.data.name;
                        $scope.mainState.$current.data.displayName = resp.data.name;
                        $scope.isTableu = true;
                        //$scope.tableuLink = value.tableuLink ? value.tableuLink:''; 
                        var placeholderDiv = document.getElementById('tableu_report3');
                        //placeholderDiv.setAttribute('fixT',Math.random());
                        var url = resp.data.reportLink ? resp.data.reportLink : '';
                        var options = {
                            hideTabs: (resp.data.tabbedViews && resp.data.tabbedViews === 'Y') ? false : true,
                            width: '100%',
                            height: '800px'
                        };
                        new tableau.Viz(placeholderDiv, url, options);
                    }
                });
            });
        } else if ($state.current.name === 'reports.details.report.about') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;

                urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.reportId);

                $http.get(urlReports).then(function (resp) {
                    $scope.reportData = resp.data;
                });
            });
        } else if ($state.current.name === 'reports.details.report.access') {
            var url = commonService.prepareReportAccessUrl($stateParams.reportId);
            $http.get(url).then(function (resp) {
                $scope.reportAccessData = resp.data;
            });

        } else if ($state.current.name === 'reports.details.report.feedback') {

            $scope.feedbackArray = [];
            searchservice.loadFeedbacks($stateParams.reportId).then(function (resp) {
                $scope.feedbackArray = resp;
            });
        }
    }
    
    $scope.feedback = '';
    $scope.postFeedback = function () {
        if ($scope.feedback.trim() !== '') {
            $scope.setLoading(true);
            searchservice.postFeedback($stateParams.reportId, $scope.feedback).then(function (/*feedObj*/) {
                $scope.feedback = '';
                searchservice.loadFeedbacks($stateParams.reportId).then(function (resp) {
                    $scope.setLoading(false);
                    $scope.feedbackArray = resp;
                }, function () {
                    $scope.setLoading(false);
                });
            }, function () {
                $scope.setLoading(false);
            });
        }
    };
});
