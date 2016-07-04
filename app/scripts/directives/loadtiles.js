'use strict';

/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTiles
 * @description
 * # loadTiles
 * Helps to load tiles in grid layout.
 * Usage: <load-tiles  tilesData="array of tile objects" userLoginName="emcloginname"></load-tiles>
 */

/*jshint sub:true*/
/*Used to avoid jshint warning for "obj['name'] is better written in dot notation" */
angular.module('myBiApp')
.directive('loadTiles', function () {
    return {
        templateUrl: 'views/tilesPage.html',
        restrict: 'E',
        replace: 'false',
        controller: 'tilesController',
        scope: {
            tilesData: '=',
            userLoginName: '@',
            onMovePanelTo: '&',
            listView: '&'
        },
        link: function postLink(scope/*, element, attrs*/) {
            scope.$watch('tilesData', function (value) {
                scope['panel'] = value;
            });
        }
    };
})
/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTilesInfinite
 * @description
 * # loadTilesInfinite
 * Helps to load tiles with infinite scroll flag/directive.
 * Usage: <load-tiles-infinite  tilesData="array of tile objects" userLoginName="emcloginname"></load-tiles-infinite>
 */
.directive('loadTilesInfinite', function () {
    return {
        templateUrl: 'views/tilesPageInfinite.html',
        restrict: 'E',
        controller: 'tilesController',
        scope: {
            tilesData: '=',
            userLoginName: '@',
            onMovePanelTo: '&',
            listView: '&'
        },
        link: function postLink(scope/*, element, attrs*/) {
            scope.$watch('tilesData', function (value) {
                scope['panel'] = value;

            });
        }
    };
})

/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTilesInfiniteSearch
 * @description
 * # loadTilesInfiniteSearch
 * Helps to load tiles with infinite scroll flag/directive in search page.
 * Usage: <load-tiles-infinite-search  tilesData="array of tile objects" userLoginName="emcloginname"></load-tiles-infinite-search>
 */
.directive('loadTilesInfiniteSearch', function () {
    return {
        templateUrl: 'views/tilesPageInfinite.search.html',
        restrict: 'E',
        controller: 'tilesController',
        scope: {
            tilesData: '=',
            userLoginName: '@',
            keyword: '@',
            listView: '&'
        },
        link: function postLink(scope/*, element, attrs*/) {
            scope.$watch('tilesData', function (value) {
                scope['panel'] = value;

            });
        }
    };
})

/**
 * @ngdoc directive
 * @name myBiApp.directive:loadTileImage
 * @description
 * # loadTileImage
 * Helps to load tile image/iframe for a tile based on report type.
 * Usage: <load-tile-image></load-tile-image>
 */
.directive('loadTileImage', function ($compile, $sce, $timeout/*, $http, commonService, userDetailsService*/) {
    return {
        template: '<div></div>',
        replace: true,
        link: function (scope, element/*, attrs*/) {
            var template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}}), url(images/charts/not-found.png)\'}"></div>';
            var ele;
            scope.externalUrl = false;
            if (scope.report.sourceSystem === 'EXTERNAL') {
                scope.externalUrl = true;
                var bg = (scope.report.additionalInfo && scope.report.additionalInfo.indexOf('#') > -1) ? 'style = background-color:' + scope.report.additionalInfo : '';
                var Desc = (scope.report.reportDesc) ? scope.report.reportDesc : '';
                template = '<div class="panel-heading" ng-class="report.externalClass" ' + bg + '>' +
                        '<p class="external-reportName">' + scope.report.name + '</p>' +
                        '<p class="external-reportDesc">' + Desc + '</p>' +
                        '</div>';
                ele = $compile(template)(scope);
                element.replaceWith(ele);
                element = ele;
            } else {
                /* report type 'webi' & RefreshStatus is Y tile should be loaded with bobj report in iframe*/
                if (scope.report.type && scope.report.type.toLowerCase() === 'webi' && scope.report.refreshStatus === 'Y') {
                    scope.report.iframeUrl = $sce.trustAsResourceUrl(scope.report.reportLinkImg);

                    $timeout(function () {
                        //sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"
                        var sandbox = '';
                        var templateIframe = '<iframe width="1000" height="1224" ng-src="{{report.iframeUrl}}"  style="';
                        var style = '-webkit-transform: scale({}); -webkit-transform-origin: 0 0; -ms-transform: scale({}); -ms-transform-origin: 0 0; -webkit-transform: scale({}); -webkit-transform-origin: 0 0; -moz-transform: scale({}); -moz-transform-origin: 0 0; transform: scale({});transform-origin: 0 0;width:1000px;height:1224px;';
                        var scaleVal = parseInt(element.parent()[0].offsetWidth) / 1000;
                        var find = '{}';
                        var re = new RegExp(find, 'g');
                        style = style.replace(re, scaleVal);

                        //Based sri request adding sandbox / iframe breakout flag based on sourcesystem of bobj
                        if (scope.report.sourceSystem && scope.report.sourceSystem.toLowerCase() === 'baaas prd') {
                            sandbox = 'sandbox="allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts"';
                        }

                        templateIframe = templateIframe + style + '" ' + sandbox + '></iframe>';
                        ele = $compile(templateIframe)(scope);
                        element.replaceWith(ele);

                    }, 500);

                } else if (scope.report.type && (scope.report.type.toLowerCase() === 'pdf' || scope.report.type.toLowerCase() === 'excel' || scope.report.type.toLowerCase() === 'webi')) {
                    if (scope.report.type.toLowerCase() === 'webi') {
                        scope.report.reportLinkImg = 'images/charts/bobj-icon.png';
                    }
                    template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}})\'}"></div>';
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                    element = ele;

                } else if (scope.report.type && (scope.report.type.toLowerCase() === 'visilums')) {
                    if (scope.report.type.toLowerCase() === 'visilums') {
                        scope.report.reportLinkImg = 'images/charts/Lumira.png';
                    }
                    template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}})\'}"></div>';
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                    element = ele;

                } else if (scope.report.type && (scope.report.type.toLowerCase() === 'tableau') /*&& scope.report.refreshStatus === 'Y'*/) {
                    template = '<div class="panel-heading class-pdf"  ng-style="{\'background-image\':\'url(images/charts/loading-icon.gif)\', \'background-size\':\'auto\'}"></div>';
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                    element = ele;
                    var img = new Image();
                    img.src = scope.report.reportLinkImg;
                    img.onload = function () {
                        template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url({{report.reportLinkImg}})\'}"></div>';
                        ele = $compile(template)(scope);
                        element.replaceWith(ele);
                        element = ele;
                    };
                    img.onerror = function () {
                        template = '<div class="panel-heading" ng-class="report.iconClass" ng-style="{\'background-image\':\'url(images/charts/not-found.png)\'}"></div>';
                        ele = $compile(template)(scope);
                        element.replaceWith(ele);
                        element = ele;
                    };
                } else {
                    ele = $compile(template)(scope);
                    element.replaceWith(ele);
                }
            }


        }
    };
})

/**
 * @ngdoc function
 * @name myBiApp.controller:tilesController
 * @description
 * # tilesController
 * Controller of the tiles. 
 */
.controller('tilesController', function ($scope, commonService, $http, CONFIG, $sce, $window) {
    $scope.panel = $scope.tilesData;
    $scope.$watch('panel.data', function (value) {
        _.map(value, function (report) {
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
                        var sourceImg = (report.sourceSystem.toString().indexOf('Enterprise')>= 0) ? report.sourceReportId + "_ent" : report.sourceReportId;
                        report.reportLinkImg = CONFIG.tableauImagesPath + encodeURIComponent(report.functionalArea) + '/' + sourceImg + '.png';
                        //report.reportLinkImg = CONFIG.tableauImagesPath+encodeURIComponent(report.functionalArea)+'/'+report.sourceReportId+'.png';
                    } else if (report.refreshStatus && report.refreshStatus === 'Y') {
                        report.reportLinkImg = report.reportLinkImg.replace('#/site', 't');
                    }
                }
            }
        });

        $scope.isLastItem = true;
        $scope.isFirstItem = true;

        if ($scope.panel) {
            if (typeof ($scope.panel.indexData) != 'undefined') {
                $scope.isLastItem = eval($scope.panel.indexData.curr + 1 === $scope.panel.indexData.total);
                $scope.isFirstItem = eval($scope.panel.indexData.curr === 0);
                $scope.$watch('panel.indexData.curr', function () {
                    $scope.isLastItem = eval($scope.panel.indexData.curr + 1 === $scope.panel.indexData.total);
                    $scope.isFirstItem = eval($scope.panel.indexData.curr === 0);
                });
            }
            if ($scope.panel.viewMoreUiLink && $scope.panel.viewMoreUiLink !== undefined) {
                $scope.viewMoreLink = ($scope.panel.viewMoreUiLink === 'reports.list') ? 'View more available reports' : 'View more';
            }
        }
    });

    $scope.collapseOpen = function () {
        $scope.panel.open = !$scope.panel.open;
    };
    
    $scope.highlight = function(text, search) {
        if (!search) {
            return $sce.trustAsHtml(text);
        }
        var lowerText = (text) ? text.toLowerCase(): '';
        var lowerSearch =(search) ? search.toLowerCase(): '';
        if(lowerText.search(lowerSearch) >= 0 ) {
            return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="highlighted">$&</span>'));
        } else {
            return $sce.trustAsHtml(text);
        }
    };
    
    $scope.loadReport = function(report) {
        var url;
        
        if(report.type === 'HTTP') {
            url = report.reportLink;
            var reportUpdateViewed = commonService.prepareUpdateReportViewedUrl($scope.userLoginName, report.sourceReportId, report.sourceSystem, 'Persona');
            $http.get(reportUpdateViewed);
        } else {
            url = 'BITool/admin/externalrepo/downloadreport/'+report.sourceReportId;
        }
        $window.open(url, '_blank');
    };
    
    $scope.changeFavorite = function (report) {
        var url = commonService.prepareUserUpdateFavoriteUrl($scope.userLoginName);

        if (report.favorite === 'N') {
            $http.get(url + report.id + '/Y').then(function () {

                report.favorite = 'Y';
            });
        } else {
            $http.get(url + report.id + '/N').then(function () {
                report.favorite = 'N';
            });
        }
    };

    /**
     *To create date object from string
     *@param dateString
     *@return dateObject
     */
    $scope.convertStringDate = function (date) {
        return new Date(date);
    };
});