'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:SearchdetailsCtrl
 * @description
 * # SearchdetailsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('SearchdetailsCtrl', function ($scope, $rootScope, $sce, $stateParams, $state, $window, $filter, searchservice, CONFIG, userDetailsService, $localStorage, commonService, $http) {
    $scope.feedbackArray = [];
    $scope.reportAccessData = {};
    $scope.isCollapsed = false;
    $scope.isTableu = false;
    setUserPreference();
    setUserLevel();
    $scope.$emit('setNavBar', true);
    
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
                    $rootScope.sourceSystem = resp.data.sourceSystem;
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader(resp.data.name);
                    $scope.isTableu = (resp.data.type === 'Tableau')? true : false;
                    
                    if($scope.isTableu) {
                        console.log('here-Y');
                        var placeholderDiv = document.getElementById('tableu_report3');
                        var url = resp.data.reportLink ? resp.data.reportLink : '';
                        var headerFlag = (resp.data.isHeaderFlag === 0) ? '?Header Flag=0&' : '?';
                        var reportToolBar = (resp.data.displayType === 'H') ? headerFlag+':toolbar=no' : 
                                ((resp.data.displayType === 'B')? headerFlag+':toolbar=bottom' : headerFlag+':toolbar=top'); 
                        var options = {
                            hideTabs: (resp.data.tabbedViews && resp.data.tabbedViews === 'Y') ? false : true,
                            width: '100%',
                            height: '800px'
                        };

                        new tableau.Viz(placeholderDiv, url+reportToolBar, options);
                    } else {
                        console.log('here-N');
                        var url = resp.data.reportLink ? resp.data.reportLink : '';

                        $scope.getOtherReportLink = function () {
                            return $sce.trustAsResourceUrl(url);
                        };
                    }
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
                    $rootScope.sourceSystem = resp.data.sourceSystem;
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader(resp.data.name)
                });
            });
        } else if ($state.current.name === 'search.details.access') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }
                if(!$rootScope.searchReportName) {
                    $http.get(urlReports).then(function (resp) {
                        $rootScope.sourceSystem = resp.data.sourceSystem;
                        ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                        emitSearchHeader(resp.data.name);
                    });
                } else {
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader($rootScope.searchReportName);
                }
                
                searchservice.loadReportAccess($stateParams.sourceReportId, $stateParams.sourceName, $stateParams.searchId, $stateParams.persona).then(function (resp) {
                    $scope.reportAccessData = resp;
                });
            });    
        } else if ($state.current.name === 'search.details.feedback') {
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }

                if(!$rootScope.searchReportName) {
                    $http.get(urlReports).then(function (resp) {
                        $rootScope.sourceSystem = resp.data.sourceSystem;
                        ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                        emitSearchHeader(resp.data.name);
                    });
                } else {
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    emitSearchHeader($rootScope.searchReportName);
                }
                
                $scope.feedbackArray = [];
                searchservice.loadFeedbacks($stateParams.searchId).then(function (resp) {
                    $scope.feedbackArray = resp;
                });
            });    
        } else if ($state.current.name === 'search.details.reportmeta') {
            $scope.isTable = true;
            $scope.reportMetaData = [];
            $scope.metaDataCopy = [];
            $scope.reportFilterMetaData = [];        
            $scope.currentPage = 1;
            $scope.numPerPage = 20;
            $scope.maxSize = 5;
            $scope.totalItem ='';
            $scope.showIcon = false;
            $scope.setLoading(true);
            
            userDetailsService.userPromise.then(function (response) {
                var urlReports;
                if ($stateParams.persona === 'Y') {
                    urlReports = commonService.prepareUserReportUrl(response[0].emcLoginName, $stateParams.searchId);
                } else {
                    urlReports = commonService.prepareUserReportUrlSearch(response[0].emcLoginName, $stateParams.sourceReportId, $stateParams.sourceName);
                }
                $http.get(urlReports).then(function (resp) {
                    emitSearchHeader(resp.data.name);
                    $rootScope.reportName = $scope.mainState.$current.data.displayName = resp.data.name;  
                    $rootScope.sourceSystem = resp.data.sourceSystem;
                    ($rootScope.sourceSystem === 'EXTERNAL')? $scope.$emit('hideReportTabs', true) : $scope.$emit('hideReportTabs', false);
                    $rootScope.sourceReportId = resp.data.sourceReportId;
                    $rootScope.repType = resp.data.type;
                    $rootScope.workbookId = resp.data.additionalInfo;
                    $scope.isTableu = ($rootScope.repType === 'Tableau')? true : false;

                    if($scope.isTableu) {
                        if($rootScope.viewTabs === 'N') {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                            var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                        } else {
                            $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId+'&sourceReportId='+ $rootScope.sourceReportId;
                            var url = commonService.prepareMetaDataUrlWork((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceSystem, $rootScope.workbookId);
                        }
                    } else {
                        $scope.downloadLink = 'BITool/home/downloadBIReportMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                        var url = commonService.prepareMetaDataUrl((($scope.currentPage - 1) * $scope.numPerPage) +  1, $scope.numPerPage, $rootScope.sourceReportId, $rootScope.sourceSystem);
                    }

                    $http.get(url).then(function (resp) {
                        if(resp.data) {
                            if(resp.data.length > 0) {
                                if($scope.isTableu) {
                                    if($rootScope.viewTabs === 'N') {
                                        $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                    } else {
                                        $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceSystem='+ $rootScope.sourceSystem+'&workbookId='+$rootScope.workbookId;
                                    }
                                } else {
                                    $scope.d3Url = 'BITool/home/getD3DendrogramForMetadata?sourceReportId='+ $rootScope.sourceReportId +'&sourceSystem='+ $rootScope.sourceSystem;
                                }
                            } else {
                                $scope.emptyMessage = 'The report does not have metadata to display.';
                                $scope.setLoading(false);
                                return;
                            }
                        }

                        $scope.reportMetaData = resp.data;
                        $scope.metaDataCopy = angular.copy($scope.reportMetaData);
                        $scope.totalItem = $scope.reportMetaData.length;

                        $scope.$watch("currentPage + numPerPage", function() {
                            $scope.setLoading(true);
                            var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                            end = begin + $scope.numPerPage;
                            $scope.reportFilterMetaData = $scope.reportMetaData.slice(begin, end);
                            $scope.metaDataMessage = showMessage($scope.currentPage, $scope.totalItem, begin, end);
                            $scope.setLoading(false);
                        });
                        $scope.setLoading(false);
                    },function(){
                        $scope.emptyMessage = 'The report does not have metadata to display.';
                    });
                });
            });
            
            $scope.resetFilterText = function() {
                $scope.showIcon = false;
                $scope.search.reportColumnName = '';
            }
            
            $scope.filterMetaData = function() {
                (!$scope.search.reportColumnName) ? $scope.showIcon = false : $scope.showIcon = true;
                
                $scope.$watch('search.reportColumnName', function(val) { 
                    $scope.currentPage = 1;
                    $scope.reportMetaData = $filter('filter')($scope.metaDataCopy, val);
                    $scope.totalItem = $scope.reportMetaData.length;
                    var begin = (($scope.currentPage - 1) * $scope.numPerPage),
                    end = begin + $scope.numPerPage;
                    $scope.reportFilterMetaData = $scope.reportMetaData.slice(begin, end);
                    $scope.metaDataMessage = showMessage($scope.currentPage, $scope.totalItem, begin, end);
                });
            };
        }
    }
    
    function showMessage(currentPage, totalItem, begin, end) {
        //($scope.currentPage === 1) ? $scope.metaDataMessage = 'Showing 20 out of '+ $scope.totalItem + ' records.' : $scope.metaDataMessage = 'Showing ' + begin +' - '+ end + ' out of ' + $scope.totalItem +' records. ';
        var message ='';
        
        if(totalItem === 0) {
            message = '';
        } else {
            if(currentPage   === 1) {
                if(totalItem > 20) {
                    message = '1 - 20 of ' + totalItem;
                } else {
                    message = totalItem + ' of ' + totalItem;
                }
            } else {
                if(totalItem > end) {
                    message = begin + ' - ' + end + ' of ' + totalItem;
                } else {
                    message = begin + ' - ' + totalItem + ' of ' + totalItem;
                }  
            }
        }

        return message;
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
    
    function emitSearchHeader(reportName) {
        $scope.mainState.$current.data.displayName = reportName;
        $rootScope.searchReportName = reportName;
        
        if($window.innerWidth < 768) {
            if(reportName.length > 45) {
                reportName = reportName.substr(0, 44)+'...';
            }
        }
        
        $scope.$emit('setSearchDisplayName', reportName);
    }
    
    function setUserLevel() {
        if(!$localStorage.myLevel) {
            userDetailsService.userPromise.then(function (userObject) {
                if (userObject[0].userinfo.badge === 'Bronze') {
                    $scope.myLevel = 'bronze-level';
                } else if (userObject[0].userinfo.badge === 'Silver') {
                    $scope.myLevel = 'silver-level';
                } else if (userObject[0].userinfo.badge === 'Gold') {
                    $scope.myLevel = 'gold-level';
                } else if (userObject[0].userinfo.badge === 'Platinum') {
                    $scope.myLevel = 'platinum-level';
                }

                $localStorage.myLevel = $scope.myLevel
                $scope.$emit('myLevelIndication', $scope.myLevel);
            });    
        } else {
            $scope.myLevel = $localStorage.myLevel;
            $scope.$emit('myLevelIndication', $scope.myLevel);
        }
    }
    
    function setUserPreference() {
        var personalization = [];
        if(!$localStorage.userTheme || !$localStorage.personalization) {
            $scope.setLoading(true);
            $http.get('BITool/home/getUserPersonalization').then(function (response) {
                if(response.data) {
                    if(response.data.favorite !== 0 && response.data.mostViewed !==0 && response.data.recommended !==0) {
                        personalization[response.data.favorite - 1] = 'favoriteReports'; 
                        personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                        personalization[response.data.recommended - 1] = 'recentViewedReports';
                    } else {
                        personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    }

                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $scope.userTheme = $localStorage.userTheme;
                    $localStorage.personalization = personalization;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                } else {
                    $localStorage.userTheme = 'default';
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $scope.userTheme = $localStorage.userTheme;
                    $localStorage.personalization = personalization;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                }
            });
            $scope.setLoading(false);
        } else {
            $scope.userTheme = $localStorage.userTheme;
            personalization = $localStorage.personalization;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
});