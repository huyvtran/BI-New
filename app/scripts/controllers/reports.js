'use strict';

/**
 * @ngdoc function
 * @name myBiApp.controller:ReportsCtrl
 * @description
 * # ReportsCtrl
 * Controller of the myBiApp
 */
angular.module('myBiApp')
.controller('ReportsCtrl', function ($scope, $localStorage, $state, $q, $http, $sce, commonService, reportsFactory, userDetailsService, CONFIG) {
    $scope.setLoading(true);
    $scope.$emit('setNavBar', true);
    $scope.access = {};
    $scope.access.limitTo = 6;
    $scope.access.subGroupItemsId = 0;
    setUserPreference();
    
    $scope.access.allReports = function () {
        userDetailsService.userPromise.then(function (userObject) {
            if (userObject[0].personaInfo.status === 'Error') {
                $scope.setLoading(false);
                $scope.personaInfo = userObject[0].personaInfo;
                $scope.groupsData = {
                    'title': '',
                    'open': 'true',
                    'limit': undefined,
                    'class_names': 'report-tile',
                    'loadmoredisable': '',
                    'service': '',
                    'data': '',
                    'pesonaError': userObject[0].personaInfo.message,
                    'rr': true
                };
            } else {  
                setUserLevel(userObject[0]);
                //getBreadCrumbLevel(false);
                $scope.$emit('bredCrumbValue', '');
                $scope.biGroup.all().then(function () {
                    var groupid = $scope.biGroup.biGroupId;
                    var groupService = new reportsFactory.reportsFactoryFunction('group', groupid);
                    groupService.loadReports().then(function () {
                        $scope.setLoading(false);
                        var title = ($scope.biGroup && $scope.biGroup.biGroups &&
                                $scope.biGroup.biGroups[0] && $scope.biGroup.biGroups[0].levelDesc) ? $scope.biGroup.biGroups[0].levelDesc : (($state && $state.$current && $state.$current.data && $state.$current.data.displayName) ? $state.$current.data.displayName : 'Reports');
                        $scope.groupsData = {
                            'title': title,
                            'open': true,
                            'limit': undefined,
                            'class_names': 'report-tile',
                            'loadmoredisable': groupService.loadmoredisable,
                            'service': groupService,
                            'data': groupService.reports,
                            'listView':$scope.listViewStatus,
                            'displayName' : $scope.mainState.$current.data.displayName,
                            'rr': true
                        };

//                        $scope.setListView(false);

                    }, function () {
                        $scope.setLoading(false);
                    });

                });
            }
        });
    };

    $scope.access.subGroupItems = function (levelid) {
        $scope.$emit('setNavBar', true);
        $scope.biGroup.all().then(function () {
            //getBreadCrumbLevel(levelid);
            $scope.$emit('bredCrumbValue', '');
            $scope.setLoading(false);
            $scope.dataObj = [];
            
            function getLevelObj(obj) {
                var filter = _.findWhere(obj, {'levelId': parseInt(levelid)});
                if (filter) {
                    $scope.mainState.$current.data.displayName = filter.levelDesc;
                    var groupid = $scope.biGroup.biGroupId;
                    if (filter.children.length !== 0) {
                        $scope.dataObj = _.map(filter.children, function (eachLevel) {
                            var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, eachLevel.levelId, true);
                            groupService.loadReports();
                            return {
                                'title': eachLevel.levelDesc,
                                'open': true,
                                'limit': 6,
                                'class_names': 'report-tile',
                                'service': groupService,
                                'levelLink': eachLevel.levelId,
                                'data': groupService.reports,
                                'listView':$scope.listViewStatus
                            };
                        });
                    } else {
                        var groupService = new reportsFactory.reportsFactoryFunction('level', groupid, levelid);
                        groupService.loadReports();
                        $scope.dataObj[0] = {
                            'title': filter.levelDesc,
                            'open': true,
                            'limit': undefined,
                            'class_names': 'report-tile',
                            'service': groupService,
                            'data': groupService.reports,
                            'listView':$scope.listViewStatus
                        };

//                        $scope.setListView(false);
                    }
                } else {
                    _.map(obj, function (eachObj) {
                        if (eachObj.children.length !== 0) {
                            getLevelObj(eachObj.children);
                        }
                        return eachObj;
                    });
                }
            }
            getLevelObj($scope.biGroup.biGroups);
        });

        $scope.access.subGroupItemsId = levelid;
    };

    $scope.access.groupItems = function (groupid) {
        $scope.biGroup.all().then(function () {
            _.map($scope.biGroup.biGroups, function (firstLevel) {
                if (firstLevel.levelId.toString() === groupid) {
                    firstLevel.loadmoredisable = false;
                }
                return firstLevel;
            });
        });
        $scope.access.subGroupItemsId = undefined;
    };

    $scope.access.checkState = function (group) {
        if ($scope.access.catGroups === group.levelId) {
            return true;
        } else if ($state.current.name === 'reports.list') {
            return true;
        } else {
            return false;
        }
    };
    
    function setUserLevel(usrObj) {
        if(!$localStorage.myLevel) {
            if (usrObj.userinfo.badge === 'Bronze') {
                $scope.myLevel = 'bronze-level';
            } else if (usrObj.userinfo.badge === 'Silver') {
                $scope.myLevel = 'silver-level';
            } else if (usrObj.userinfo.badge === 'Gold') {
                $scope.myLevel = 'gold-level';
            } else if (usrObj.userinfo.badge === 'Platinum') {
                $scope.myLevel = 'platinum-level';
            }

            $localStorage.myLevel = $scope.myLevel
            $scope.$emit('myLevelIndication', $scope.myLevel);
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
                    personalization[response.data.favorite - 1] = 'favoriteReports'; 
                    personalization[response.data.mostViewed - 1] = 'mostViewedReports';
                    personalization[response.data.recommended - 1] = 'recentViewedReports';

                    $localStorage.userTheme = CONFIG.userTheme[response.data.userTheme];
                    $localStorage.personalization = personalization;
                    (response.data.isListViewed === 0 || response.data.isListViewed === null || !response.data.isListViewed) ? $localStorage.listViewStatus = false : $localStorage.listViewStatus = true;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                } else {
                    personalization = ['recentViewedReports', 'favoriteReports', 'mostViewedReports'];
                    $localStorage.personalization = personalization;
                    $localStorage.userTheme = 'default';
                    $localStorage.listViewStatus = false;
                    $scope.userTheme = $localStorage.userTheme;
                    $scope.listViewStatus = $localStorage.listViewStatus;
                    $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
                }
            });
            $scope.setLoading(false);
        } else {
            personalization = $localStorage.personalization;
            $scope.userTheme = $localStorage.userTheme;
            $scope.listViewStatus = $localStorage.listViewStatus;
            $scope.$emit('myThemeSettings', $scope.userTheme, personalization);
        }
    }
    
    $scope.setListView = function (status) {

        if ($scope.groupsData) {
            $scope.groupsData.listView = status;
            //$scope.groupsData['listView']=status;
        }
        if (!$scope.dataObj) {
            return;
        }
        else {
            for (var i in $scope.dataObj) {
                $scope.dataObj[i].listView = status;
            }
        }
        
//        userDetailsService.userPromise.then(function(userObj) {
//            var putObj = {
//                'userId' : userObj[0].uid,
//                'isListViewed' :(status === true) ? 1 : 0,
//            };
//
//            $http.put('BITool/home/saveOrUpdateUserPersonalization', putObj)
//                .then(function (resp, status, headers) {
//
//                }, function (resp, status, headers, config) {
//
//                });
//        });
    }
})
.filter('filterReports', function () {
    return function (items, levelId) {
        return levelId === 0 ? items : _.filter(items, function (eachitem) {
            return eachitem.levelId === levelId;
        });
    };
});