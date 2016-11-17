'use strict';

/**
 * @ngdoc service
 * @name myBiApp.reportsMenu
 * @description
 * # reportsMenu
 * Service in the myBiApp.
 */
angular.module('myBiApp')
.service('reportsMenu', function reportsMenu($http, $q, userDetailsService, commonService, $sce, CONFIG) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    this.biGroups = {};
    this.biGroupId = '';
    this.operationalLink = '';
    var groups = [];

    var defer = $q.defer();

    var reports = defer.promise;
    //get user details
    userDetailsService.userPromise.then(function (response) {
        //url to get levels of group user belongs to
        var path = commonService.prepareUserReportDashboardUrl(response[0].emcLoginName);
        $http.get(path).then(function (resp) {
            if ((resp.data.grpLevels === undefined || resp.data.grpLevels === null) || (resp.data.grpLevelMap === undefined || resp.data.grpLevelMap === null)) {
                this.biGroups = [];
                defer.resolve([]);
                return;
            }
            /**
             * @ngdoc property
             * @name myBiApp.reportsMenu.biGroupId
             * @description Group id of user belongs to and will be used in multiple places.
             */
            this.biGroupId = resp.data.grpLevels[0].groupId;
            /**
             * @ngdoc property
             * @name myBiApp.reportsMenu.operationalLink
             * @description operational dashboard Link for user. this link will be used in operational dashboard page.
             */
            this.operationalLink = $sce.trustAsResourceUrl(resp.data.operationalDashboardPage);

            //converts grpLevelMap object values to Array of objects
            var levels = _.map(resp.data.grpLevelMap, function (val) {
                return val;
            });

            //returns all sub array of elements to parent array. ex: [[1,2],[3,4]] converts to [1,2,3,4]
            levels = Array.prototype.concat.apply([], levels);

            /**
             * @ngdoc function
             * @name myBiApp.reportsMenu.formatLevel
             * @description structure array of parent & children to parent -> child -> sub child structure.
             */
            var formatLevel = function (data, levelnumber, parentId) {
                var formateddata = [];
                formateddata = _.chain(data)
                        .filter(function (eachLevelObj) {
                            return eachLevelObj.levelNumber === levelnumber && eachLevelObj.parentLevelId === parentId;
                        })
                        .value();
                if (formateddata.length !== 0) {
                    _.map(formateddata, function (eachItem) {
                        eachItem.collapsed = true;//making each level folder collapse by default
                        eachItem.children = formatLevel(data, levelnumber + 1, eachItem.levelId);
                        return eachItem;
                    });
                }
                else {
                    return [];
                }
                return formateddata;
            };

            var biGroupData = formatLevel(levels, 1, null);
            _.map(biGroupData, function (eachLevel) {
                /*var tileData = pullReportData(eachLevel.children);
                 eachLevel.tiles = Array.prototype.concat.apply([],tileData);*/
                eachLevel.tiles = [];
                eachLevel.loadmoredisable = false;
                return eachLevel;
            });
            if (biGroupData.length > 0) {
                biGroupData[0].collapsed = false;
                if (biGroupData[0].children && biGroupData[0].children.length > 0) {
                    biGroupData[0].children[0].collapsed = false;
                }

            }

            //groups = biGroupData;
            this.biGroups = biGroupData;
            defer.resolve(biGroupData);
        }.bind(this));
    }.bind(this));




    this.all = function () {
        return reports;
    };

    this.getRepots = function () {
        return _.uniq(groups, function (item/*, key, id*/) {
            return item.id;
        });
    };

    this.loadReports = function (groupid, levelid, viewMore) {
        var url = '', enable = true;

        var firstGrp = _.findWhere(this.biGroups, {'levelId': groupid});
        /*_.map(this.biGroups, function(firstLevel){
         _.map(firstLevel.children, function(secondLevel) {
         firstGrp = _.findWhere(secondLevel.children,{'levelId':parseInt(levelid)})
         });
         });*/
        if (viewMore) {
            firstGrp.offset = 1;
        }
        firstGrp.loadmoredisable = true;


        if (!firstGrp.offset) {
            firstGrp.offset = 1;
        }
        userDetailsService.userPromise.then(function (response) {
            if (this.biGroupId === '') {
                return;
            }
            url = commonService.prepareUserReportLevelUrl(response[0].emcLoginName, this.biGroupId,
                    levelid, firstGrp.offset, 10);
            //'BITool/reportDashboard/report/group/'+ groupid +'/'+ firstGrp.offset +'/10 ';

            $http.get(url).then(function (resp) {
                _.map(resp.data.allReportsForDpt, function (report) {
                    report.levelId = levelid;
                    report.reportLinkImg = report.reportLink + '.png';
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
                            }
                        }
                    }
                    return report;
                });
                if (enable && resp.data.allReportsForDpt.length === 10) {
                    firstGrp.loadmoredisable = false;


                }

                if (firstGrp.offset === 1) {
                    firstGrp.tiles = resp.data.allReportsForDpt;
                }
                else {
                    Array.prototype.push.apply(firstGrp.tiles, resp.data.allReportsForDpt);
                }
                firstGrp.offset += 10;

            }.bind(this));

        }.bind(this));
    };
});