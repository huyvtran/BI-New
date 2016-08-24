'use strict';

/**
 * @ngdoc service
 * @name myBiApp.reportsFactory
 * @description
 * # reportsFactory
 * Factory in the myBiApp.
 */
angular.module('myBiApp')
.factory('reportsFactory', function (commonService, userDetailsService, $http, $q, CONFIG) {
    // Service logic
    // ...
    var reportsFactoryFunction = function (type, groupid, levelid, searchfilter, stopInfinite) {
        this.reports = [];
        this.loadmoredisable = false;
        this.loadReports = function () {
            this.loadmoredisable = true;
            var defer = $q.defer();
            
            userDetailsService.userPromise.then(function (response) {
                var url = '',
                /**
                 * Filter variable is the flag/key of response object which has the reports arraylist.
                 */
                filter;
                
                if (type === 'favorite') {
                    url = commonService.prepareFavoriteReportUrl(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit);
                    filter = 'favoriteReports';
                } else if (type === 'group') {
                    if (groupid === '') {
                        return;
                    }
                    url = commonService.prepareGroupReportUrl(response[0].emcLoginName, groupid, this.reports.length + 1, CONFIG.limit);
                    filter = 'allReportsForDpt';
                } else if (type === 'level') {
                    if (this.biGroupId === '') {
                        return;
                    }
                    url = commonService.prepareUserReportLevelUrl(response[0].emcLoginName, groupid, levelid, this.reports.length + 1, CONFIG.limit);
                    filter = 'allReportsForDpt';
                } else if (type === 'search') {
                    //while search groupid is searchtext & level id is persona y or n
                    groupid = decodeURIComponent(groupid);
                    if (levelid === 'Y') {
                        if(searchfilter) { 
                            url = commonService.prepareSearchUrlPersonaFilter(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid, searchfilter);
                        } else { 
                            url = commonService.prepareSearchUrlPersona(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid);
                        }
                    } else {
                        if(searchfilter) { 
                            url = commonService.prepareSearchUrlFilter(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid, searchfilter);
                        } else { 
                            url = commonService.prepareSearchUrl(response[0].emcLoginName, this.reports.length + 1, CONFIG.limit, groupid);
                        }
                    }

                    filter = '';
                }
                
                $http.get(url).then(function (resp) {
                    /**
                     * arrayReports is an array with all reports list from response with filter or without filter based on webservice
                     */
                    var arrayReports = resp.data ? resp.data : [];

                    /**
                     * if filter is empty, expecting resp.data is an array of reports otherwise resp.data[filter] is an array of reports.
                     */
                    if (filter !== '') {
                        arrayReports = resp.data[filter] ? resp.data[filter] : [];
                    }
                    
                    _.map(arrayReports, function (report) {
                        if (type === 'search') {
                            if (levelid === 'Y') {
                                report.reportName = report.name;
                                report.reportType = report.type;
                                report.createdDate = report.createDate;
                                report.updatedDate = report.updateDate;
                            }
                        } else if (levelid) {
                            report.levelId = levelid;
                        }

                        report.reportLinkImg = report.reportLink + '.png';
                        report.iconClass = 'class-tableau';
                        
                        if (report.type === undefined && report.reportType !== undefined) {
                            report.type = report.reportType;
                        }
                        
                        if (report.type) {
                            if (report.type.toLowerCase() === 'pdf') {
                                report.reportLinkImg = 'images/charts/pdf-icon.png';
                                report.iconClass = 'class-pdf';
                            } else if (report.type.toLowerCase() === 'excel') {
                                report.reportLinkImg = 'images/charts/Excel-icon.png';
                                report.iconClass = 'class-excel';
                            } else if (report.type.toLowerCase() === 'webi') {
                                report.reportLinkImg = report.reportLink;
                                report.iconClass = 'class-bobj';
                            } else if (report.type.toLowerCase() === 'tableau') {
                                if (report.refreshStatus === undefined || report.refreshStatus === 'N') {
                                    var sourceImg = (report.sourceSystem.toString().indexOf('Enterprise') >= 0) ? report.sourceReportId + "_ent" : report.sourceReportId;
                                    report.reportLinkImg = CONFIG.tableauImagesPath + encodeURIComponent(report.functionalArea) + '/' + sourceImg + '.png';
                                } else if (report.refreshStatus && report.refreshStatus === 'Y') {
                                    report.reportLinkImg = report.reportLinkImg.replace('#/site', 't');
                                }
                            }
                        }
                        
                        return report;
                    });

                    if (arrayReports && arrayReports.length === CONFIG.limit) {
                        this.loadmoredisable = false;
                    }
                    
                    if (stopInfinite) {
                        this.loadmoredisable = true;
                    }
                    
                    if (this.reports.length === 0) {
                        this.reports = arrayReports;
                    } else {
                        Array.prototype.push.apply(this.reports, arrayReports);
                    }
                    
                    defer.resolve({});
                    
                }.bind(this));
            }.bind(this));
            return defer.promise;
        };
    };

    // Public API here
    return {
        reportsFactoryFunction: reportsFactoryFunction
    };
});