'use strict';

/**
 * @ngdoc service
 * @name myBiApp.reportSummaryService
 * @description
 * # reportSummaryService
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('reportSummaryService', function reportSummaryService($q, $http, commonService, userDetailsService, CONFIG) {
    // AngularJS will instantiate a singleton by calling "new" on this function

    this.getReportSummary = function () {
        var defer = $q.defer(), reportSummary = defer.promise;
        userDetailsService.userPromise.then(function (response) {
            var url = commonService.prepareUserReportSummaryUrl(response[0].emcLoginName);
            $http.get(url).then(function (resp) {
                var data = _.chain(resp.data)
                        .pick('mostViewedReports', 'favoriteReports', 'recentViewedReports')
                        .mapObject(function (eachGrp) {
                            return _.map(eachGrp, function (eachReport) {
                                eachReport.levelId = 1;
                                eachReport.reportLinkImg = eachReport.reportLink + '.png';
                                eachReport.iconClass = 'class-tableau';
                                if (eachReport.type) {

                                    if (eachReport.type.toLowerCase() === 'pdf') {
                                        eachReport.reportLinkImg = 'images/charts/pdf-icon.png';
                                        eachReport.iconClass = 'class-pdf';
                                    } else if (eachReport.type.toLowerCase() === 'excel') {
                                        eachReport.reportLinkImg = 'images/charts/Excel-icon.png';
                                        eachReport.iconClass = 'class-excel';
                                    } else if (eachReport.type.toLowerCase() === 'webi') {
                                        eachReport.reportLinkImg = eachReport.reportLink;
                                        eachReport.iconClass = 'class-bobj';
                                    } else if (eachReport.type.toLowerCase() === 'tableau') {
                                        if (eachReport.refreshStatus === undefined || eachReport.refreshStatus === 'N') {
                                            var sourceImg = (eachReport.sourceSystem.toString().indexOf('Enterprise') >= 0) ? eachReport.sourceReportId + "_ent" : eachReport.sourceReportId;
                                            eachReport.reportLinkImg = CONFIG.tableauImagesPath + encodeURIComponent(eachReport.functionalArea) + '/' + sourceImg + '.png';
                                        } else if (eachReport.refreshStatus && eachReport.refreshStatus === 'Y') {
                                            eachReport.reportLinkImg = eachReport.reportLinkImg.replace('#/site', 't');
                                        }
                                    }
                                }
                                return eachReport;
                            });
                        })
                        .value();
                defer.resolve(data);
            });
        });

        return reportSummary;
    };
});