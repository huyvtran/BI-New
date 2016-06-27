'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ModalCtrl', function ($scope, $uibModalInstance, items, $http, $q) {
    $scope.items = items;
    $scope.exFlag = (items.sourceSystem === 'EXTERNAL') ? true : false;
    $scope.levelGroupMaps = [{
        'selectedlevel': 0,
        'selectedgroup': 0
    }];
    $scope.oldList = [];
    $scope.deletedLevelAndGroupIds = [];
    $scope.updatefields = true;
    $scope.progress = false;
    $scope.saveText = '';
    $scope.tabchange = function (val) {
        $scope.updatefields = val;
        $scope.saveText = '';
    };
    
    if ($scope.exFlag) {
        delete $scope.items.createdBy;
        delete $scope.items.updatedBy;
        delete $scope.items.groupId;
        delete $scope.items.groupName;
        var getReportDetails = $http.get('BITool/admin/externalrepo/searchreport/' + $scope.items.sourceReportId);
    } else {
        var getReportDetails = $http.get('BITool/admin/getReport/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem);
    }
    
    if($scope.items.id) {
        var getReportLevelGroup = $http.get('BITool/admin/getLevelAndGroup/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem+ '?reportId=' + $scope.items.id);
    } else {
        var getReportLevelGroup = $http.get('BITool/admin/getLevelAndGroup/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem);
    }
    
    getReportDetails.then(function (response) {
        var resp = response.data;
        $scope.items.owner = resp.owner;
        $scope.items.reportDesc = resp.reportDesc;
        $scope.items.refreshStatus = (resp.refreshStatus) ? resp.refreshStatus : 'N';
        $scope.items.tabbedViews = (resp.tabbedViews) ? resp.tabbedViews : 'N';
        //$scope.items.recommended = (resp.recommended)? resp.recommended : 'N';
        $scope.items.reportLink = resp.reportLink;
        $scope.items.functionalArea = resp.functionalArea;
        $scope.items.functionalAreaLvl1 = resp.functionalAreaLvl1;
        $scope.items.functionalAreaLvl2 = resp.functionalAreaLvl2;
        $scope.items.linkTitle = resp.linkTitle;
        $scope.items.linkHoverInfo = resp.linkHoverInfo;
        $scope.items.createdDate = resp.createdDate;
        $scope.items.updatedDate = resp.updatedDate;
        $scope.items.sourceSystem = resp.sourceSystem;
        $scope.items.viewCount = resp.viewCount;
        $scope.items.additionalInfo = resp.additionalInfo;
        $scope.items.systemDescription = resp.systemDescription;
        $scope.items.reportName = resp.reportName;
        $scope.items.reportType = resp.reportType;
    })
    .finally(function () {
        getReportLevelGroup.then(function (response) {
            $scope.levelGroup = response.data;
            console.log($scope.levelGroup);
            var maps = _.map($scope.levelGroup.levelAndGroupIds, function (eachMap) {
                return {
                    'selectedlevel': parseInt(eachMap.levelId),
                    'selectedgroup': eachMap.groupId,
                    'recommendedSeq': eachMap.recommendedSeq
                };
            });
            if (maps.length > 0) {
                $scope.levelGroupMaps = maps;
                $scope.oldList = $scope.levelGroup.levelAndGroupIds;
            }
        });
    });

    $scope.addLevelGroup = function () {
        $scope.levelGroupMaps.push({
            'selectedlevel': 0,
            'selectedgroup': 0,
            'recommendedSeq': null
        });
    };
    
    $scope.removeLevelGroup = function (index) {
        if (index > -1) {
            var rowVal = {
                'levelId': 0,
                'groupId': 0,
                'recommendedSeq':null
            };
            rowVal.levelId = $scope.levelGroupMaps[index].selectedlevel;
            rowVal.groupId = $scope.levelGroupMaps[index].selectedgroup;
            rowVal.recommendedSeq = $scope.levelGroupMaps[index].recommendedSeq;
            $scope.deletedLevelAndGroupIds.push(rowVal);
            $scope.levelGroupMaps.splice(index, 1);
            console.log($scope.levelGroupMaps.length);
//            if($scope.levelGroupMaps.length === 0){
//                $scope.levelGroupMaps.push({
//                    'selectedlevel': 0,
//                    'selectedgroup': 0,
//                    'recommendedSeq': null
//                });
//            }
        }
    };

    $scope.ok = function () {       
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $scope.saveText = 'saving...';
        $scope.progress = true;
        if ($scope.updatefields) {
            $http.put("BITool/admin/updateReport", $scope.items)
                .then(function (updatedData, status, headers) {
                    $scope.progress = false;
                    $scope.saveText = updatedData.data.message;
                    $scope.items.id = updatedData.data.id;
                    updateGroupsAndLevels($scope.items.id);
                }, function (updatedData, status, headers, config) {
                    console.log('2 - ' +  updatedData);
                    $scope.progress = false;
                    $scope.saveText = updatedData.data.message;
                });
        } else {
            var groupsandlevels = {
                'sourceReportId': $scope.items.sourceReportId,
                'sourceSystem': $scope.items.sourceSystem,
                'levelAndGroupIds': [],
                'deletedLevelAndGroupIds':[],
                'biReportId': ($scope.items.id)? $scope.items.id : null 
            };
            for (var i = 0; i < $scope.levelGroupMaps.length; i++) {    
                var levelGroupMap = {
                    'levelId': 0,
                    'groupId': 0
                };
                if ($scope.levelGroupMaps[i].selectedlevel && $scope.levelGroupMaps[i].selectedgroup) {
                    // groupsandlevels.levelAndGroupIds[$scope.levelGroupMaps[i].selectedgroup]=$scope.levelGroupMaps[i].selectedlevel;
                    levelGroupMap.levelId = $scope.levelGroupMaps[i].selectedlevel;
                    levelGroupMap.groupId = $scope.levelGroupMaps[i].selectedgroup;
                    levelGroupMap.recommendedSeq = $scope.levelGroupMaps[i].recommendedSeq;
                    groupsandlevels.levelAndGroupIds.push(levelGroupMap);
                }
            }
            
            groupsandlevels.deletedLevelAndGroupIds = getDifference($scope.oldList, groupsandlevels.levelAndGroupIds);
            
            $http.put("BITool/admin/updateReportGroupObj", groupsandlevels).then(function (resp) {
                $scope.oldList = groupsandlevels.levelAndGroupIds;
                $scope.deletedLevelAndGroupIds = [];
                console.log(resp);
                $scope.progress = false;
                $scope.saveText = resp.data.message;
            }, function (resp) {
                console.log('2 - ' +  resp);
                $scope.progress = false;
                $scope.saveText = resp.data.message;;
            });
        }
        
//        $timeout(function() {
//            $uibModalInstance.close(returnObj);
//        }, 4000);
        
        //$uibModalInstance.close(returnObj);
    };

    $scope.cancel = function () {
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $uibModalInstance.close(returnObj);
    };
    
    function getDifference(oldList, newList) {
        return _.filter(oldList, function(val){
            return !_.findWhere(newList,  val);
        });
    }
    
    function updateGroupsAndLevels(id) {
        var getReportLevelGroup = $http.get('BITool/admin/getLevelAndGroup/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem+ '?reportId=' + id);
        getReportLevelGroup.then(function (response) {
            $scope.levelGroup = response.data;
            console.log($scope.levelGroup);
            var maps = _.map($scope.levelGroup.levelAndGroupIds, function (eachMap) {
                return {
                    'selectedlevel': parseInt(eachMap.levelId),
                    'selectedgroup': eachMap.groupId,
                    'recommendedSeq': eachMap.recommendedSeq
                };
            });
            if (maps.length > 0) {
                $scope.levelGroupMaps = maps;
                $scope.oldList = $scope.levelGroup.levelAndGroupIds;
            }
        });
    }
});