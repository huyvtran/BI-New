'use strict';

/**
 * @ngdoc service
 * @name myBiApp.searchservice
 * @description
 * # searchservice
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('searchservice', function searchservice($http, WEBSERVICEURL, userDetailsService, $q, commonService) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.feedbackArray = [];

    /**
     * @ngdoc function
     * @name myBiApp.searchservice.postFeedback
     * @description
     * helps to post the feedbacks to a report.  
     */
    this.postFeedback = function (reportId, feedback) {
        var defer = $q.defer();
        userDetailsService.userPromise.then(function (userArray) {
            var postObj = {
                'userName': userArray[0].emcLoginName,
                'reportId': reportId,
                'feedback': feedback
            };
            $http.post(WEBSERVICEURL.feedbackPost, postObj).then(function (/*response*/) {
                defer.resolve(postObj);
            });
        });
        return defer.promise;
    };

    /**
     * @ngdoc function
     * @name myBiApp.searchservice.loadFeedbacks
     * @description
     * helps to get the list of all feedbacks to a report.  
     */
    this.loadFeedbacks = function (reportId) {
        var defer = $q.defer();
        $http.get(commonService.prepareFeedbackUrl(reportId)).then(function (resp) {
            this.feedbackArray = resp.data;
            defer.resolve(resp.data);
        }.bind(this));
        return defer.promise;
    };

    /**
     * @ngdoc function
     * @name myBiApp.searchservice.loadReportAccess
     * @description
     * helps to get the items which tells about how to request access for a report.  
     */
    this.loadReportAccess = function (sourceReportId, sourceSystemName, searchid, persona) {
        var defer = $q.defer(), url;
        if (persona === 'Y') {
            url = commonService.prepareReportAccessUrl(searchid);
        } else {
            url = commonService.prepareReportAccessUrlSearch(sourceReportId, sourceSystemName);
        }
        $http.get(url).then(function (resp) {
            defer.resolve(resp.data);
        }.bind(this));
        return defer.promise;
    };
});
