'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:SearchdetailsCtrl
 * @description
 * # SearchdetailsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('SearchdetailsCtrl', function ($scope, $rootScope, $stateParams, $state, searchservice, userDetailsService, commonService, $http) {
    $scope.feedbackArray = [];
    $scope.reportAccessData = {};
    
    if ($stateParams.sourceReportId) {

        //$scope.mainState.$current.data.displayName = $rootScope.searchObject.reportName;
        //Update search Id in headerCrtl
        /**
         * To update the tab urls with report id.
         * TODO: without passing searchid also.. this functionality would work as expected.
         */
        $scope.updateSearchId($stateParams.searchId);
        if ($state.current.name === 'search.details.report') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }

                $http.get(urlReports).then(function (resp) {
                    //Update user view count
                    var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl(response[0].emcLoginName, resp.data.sourceReportId, resp.data.sourceSystem, 'Search');
                    $http.get(reportUpdateViewed);

                    $scope.mainState.$current.data.displayName = resp.data.name;
                    (resp.data.sourceSystem === 'EXTERNAL')? $scope.$emit('reportAccessFlag'):'';
                    $scope.isTableu = true;
                    var placeholderDiv = document.getElementById('tableu_report3');
                    //placeholderDiv.setAttribute('fixT',Math.random());
                    var url = resp.data.reportLink ? resp.data.reportLink : '';
                    var options = {
                        hideTabs: (resp.data.tabbedViews && resp.data.tabbedViews === 'Y') ? true : false,
                        width: '100%',
                        height: '800px'
                    };
                    new tableau.Viz(placeholderDiv, url, options);
                });
            });
            //TODO Remove isTableu from template for showing iframe or grid or d3 reports.

        } else if ($state.current.name === 'search.details.about') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }

                $http.get(urlReports).then(function (resp) {
                    $scope.reportData = resp.data;
                });
            });
        } else if ($state.current.name === 'search.details.access') {
            searchservice.loadReportAccess($stateParams.sourceReportId, $stateParams.sourceName, $stateParams.searchId, $stateParams.persona).then(function (resp) {
                $scope.reportAccessData = resp;
            });
        } else if ($state.current.name === 'search.details.feedback') {

            $scope.feedbackArray = [];
            searchservice.loadFeedbacks($stateParams.searchId).then(function (resp) {
                $scope.feedbackArray = resp;
            });
        }

    }

    $scope.feedback = '';
    $scope.postFeedback = function () {
        if ($scope.feedback.trim() !== '') {
            $scope.setLoading(true);
            searchservice.postFeedback($stateParams.searchId, $scope.feedback).then(function (/*feedObj*/) {
                $scope.feedback = '';
                searchservice.loadFeedbacks($stateParams.searchId).then(function (resp) {
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
