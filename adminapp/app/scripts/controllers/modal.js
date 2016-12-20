'use strict';

/**
 * @ngdoc function
 * @name adminPageApp.controller:ModalCtrl
 * @description
 * # ModalCtrl
 * Controller of the adminPageApp
 */
angular.module('adminPageApp')
.controller('ModalCtrl', function ($scope, $uibModalInstance, items, $http, $q, $timeout) {
    if(items.sourceSystem === 'EXTERNAL')  {
        $scope.exFlag = true;
    } else {
        $scope.exFlag = false;
    }
    
    $scope.convertStringDate = function (date) {
        return new Date(date);
    };
    
    $scope.items = items;
    $scope.headerFlag = ((items.isBUFlag && $scope.userObject.userinfo.role.toLowerCase() === 'buadmin')|| $scope.userObject.userinfo.role.toLowerCase() === 'admin')? true : false;
    $scope.levelGroupMaps = [{
        'selectedLevel': 0,
        'selectedGroup': 0
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
    $scope.enableError = true;
    $scope.enableErrorMessage = '';
    
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
        $scope.items.displayType = resp.displayType;
        $scope.items.isHeaderFlag = resp.isHeaderFlag;
        $scope.items.displayType = ($scope.items.displayType === null) ? 'B' : $scope.items.displayType;
        $scope.items.isHeaderFlag = ($scope.items.isHeaderFlag === null) ? '1' : $scope.items.isHeaderFlag.toString();
        $scope.isHeaderVal = $scope.items.isHeaderFlag;
    })
    .finally(function () {
        getReportLevelGroup.then(function (response) {
            $scope.levelGroup = response.data;
            var maps = _.map($scope.levelGroup.levelAndGroupIds, function (eachMap) {
                return {
                    'selectedGroup': eachMap.groupId,
                    'selectedLevel': (eachMap.levelId)? parseInt(eachMap.levelId):'',
                    'selectedParentLevel': (eachMap.parentLevelId)? parseInt(eachMap.parentLevelId):'',
                    'selectedChildLevel': (eachMap.childLevelId)? parseInt(eachMap.childLevelId):'',
                    'selectedSubChildLevel': (eachMap.subChildLevelId)? parseInt(eachMap.subChildLevelId):'',
                    'recommendedSeq': eachMap.recommendedSeq,
                    'parentLevelList' : (eachMap.parentLevelList)? eachMap.parentLevelList : [],
                    'childLevelList' : (eachMap.childLevelList)? eachMap.childLevelList : [],
                    'subChildLevelList' : (eachMap.subChildLevelList)? eachMap.subChildLevelList : []
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
            'selectedLevel': 0,
            'selectedGroup': 0,
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
            
            rowVal.levelId = $scope.levelGroupMaps[index].selectedLevel;
            rowVal.groupId = $scope.levelGroupMaps[index].selectedGroup;
            rowVal.recommendedSeq = $scope.levelGroupMaps[index].recommendedSeq;
            $scope.deletedLevelAndGroupIds.push(rowVal);
            $scope.levelGroupMaps.splice(index, 1);
            
            if($scope.levelGroupMaps.length === 0) {
                $scope.levelGroupMaps.push({
                    'selectedLevel': 0,
                    'selectedGroup': 0,
                    'recommendedSeq': null
                });
            }
        }
    };

    $scope.ok = function () {
        $scope.items = _.omit($scope.items,'isBUFlag');
        $scope.items.isHeaderFlag = parseInt($scope.isHeaderVal, 10);
        
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        
        $scope.saveText = 'saving...';
        $scope.progress = true;
        if ($scope.updatefields) {
            $http.put("BITool/admin/updateReport", $scope.items)
                .then(function (updatedData, status, headers) {
                    $scope.isHeaderVal.toString();
                    $scope.progress = false;
                    $scope.saveText = updatedData.data.message;
                    $scope.items.id = updatedData.data.id;
                    updateGroupsAndLevels($scope.items.id);
                }, function (updatedData, status, headers, config) {
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
                
                if ($scope.levelGroupMaps[i].selectedLevel && $scope.levelGroupMaps[i].selectedGroup) {
                    levelGroupMap.levelId = $scope.levelGroupMaps[i].selectedLevel;
                    levelGroupMap.groupId = $scope.levelGroupMaps[i].selectedGroup;
                    levelGroupMap.recommendedSeq = $scope.levelGroupMaps[i].recommendedSeq;
                    groupsandlevels.levelAndGroupIds.push(levelGroupMap);
                } else {
                    $scope.saveText = '';
                    $scope.enableError = false;
                    $scope.enableErrorMessage = 'Please Select Persona and Level';
                }
            }
            
            groupsandlevels.deletedLevelAndGroupIds = getDifference($scope.oldList, groupsandlevels.levelAndGroupIds);

            if($scope.enableError) {
                $http.put("BITool/admin/updateReportGroupObj", groupsandlevels).then(function (resp) {
                    $scope.oldList = groupsandlevels.levelAndGroupIds;
                    $scope.deletedLevelAndGroupIds = [];
                    $scope.progress = false;
                    $scope.saveText = resp.data.message;
                }, function (resp) {
                    $scope.progress = false;
                    $scope.saveText = resp.data.message;;
                });
            } else {
                $timeout(function() {
                    $scope.enableError = true;
                    $scope.enableErrorMessage = '';
                }, 2000);
                $scope.saveText = '';
                $scope.progress = false;
            }
        }
        //$uibModalInstance.close(returnObj);
    };

    $scope.cancel = function () {
        var returnObj = {
            items: $scope.items,
            levelGroups: $scope.levelGroupMaps
        };
        $uibModalInstance.close(returnObj);
    };
    
    $scope.populateParentLevel = function(groupId, index, listFlag) {
        $http.get('BITool/admin/getParentLevelByPersona?personaId='+groupId)
            .then(function (resp) {
                if (resp.data) {
                    var listItems = updateLeveAndGroupList($scope.levelGroupMaps, index, resp.data, listFlag);
                    $scope.levelGroupMaps = listItems;
                } else {
                    $scope.messageAlertError = "Error While fetching the level list";
                }
            }, function () {
            });
    };
    
    $scope.populateChildLevel = function(levelId, index, listFlag) {
        if(levelId) {
            $http.get('BITool/admin/getParentOrChildLevel?levelId='+levelId)
                .then(function (resp) {
                    if (resp.data) {
                        var listItems = updateLeveAndGroupList($scope.levelGroupMaps, index, resp.data, listFlag);
                        $scope.levelGroupMaps = listItems;
                        $scope.levelGroupMaps[index].selectedLevel = levelId;
                    } else {
                        $scope.messageAlertError = "Error While fetching the level list";
                    }
                }, function () {
                });
        } else {
            var listItems = resetLeveAndGroupList($scope.levelGroupMaps, index, listFlag);
            $scope.levelGroupMaps = listItems;
            setLevelId($scope.levelGroupMaps, index, listFlag);
        }
    };
    
    $scope.populateSubChildLevel = function(levelId, index, listFlag) {
        if(levelId) {
            $scope.levelGroupMaps[index].selectedLevel = levelId;
        } else {
            setLevelId($scope.levelGroupMaps, index, listFlag);
        }
    }
    
    function getDifference(oldList, newList) {
        return _.filter(oldList, function(val){
            return !_.findWhere(newList, {groupId: val.groupId, levelId: val.levelId});
        });
    }
    
    function updateGroupsAndLevels(id) {
        var getReportLevelGroup = $http.get('BITool/admin/getLevelAndGroup/' + $scope.items.sourceReportId + '/' + $scope.items.sourceSystem+ '?reportId=' + id);
        getReportLevelGroup.then(function (response) {
            $scope.levelGroup = response.data;
            var maps = _.map($scope.levelGroup.levelAndGroupIds, function (eachMap) {
                return {
                    'selectedGroup': eachMap.groupId,
                    'selectedLevel': (eachMap.levelId)? parseInt(eachMap.levelId):'',
                    'selectedParentLevel': (eachMap.parentLevelId)? parseInt(eachMap.parentLevelId):'',
                    'selectedChildLevel': (eachMap.childLevelId)? parseInt(eachMap.childLevelId):'',
                    'selectedSubChildLevel': (eachMap.subChildLevelId)? parseInt(eachMap.subChildLevelId):'',
                    'recommendedSeq': eachMap.recommendedSeq,
                    'parentLevelList' : (eachMap.parentLevelList)? eachMap.parentLevelList : [],
                    'childLevelList' : (eachMap.childLevelList)? eachMap.childLevelList : [],
                    'subChildLevelList' : (eachMap.subChildLevelList)? eachMap.subChildLevelList : []
                };
            });
            if (maps.length > 0) {
                $scope.levelGroupMaps = maps;
                $scope.oldList = $scope.levelGroup.levelAndGroupIds;
            }
        });
    }
    
    function updateLeveAndGroupList(fullList, index, newList, listName) {
        if(listName === 'parentLevelList') {
            fullList[index].parentLevelList  = newList;
            fullList[index].childLevelList = [];
            fullList[index].subChildLevelList = [];
            fullList[index].selectedParentLevel = '';
            fullList[index].selectedChildLevel = '';
            fullList[index].selectedSubChildLevel = '';
        } else if(listName === 'childLevelList') {
            fullList[index].childLevelList = newList;
            fullList[index].subChildLevelList = [];
            fullList[index].selectedChildLevel = '';
            fullList[index].selectedSubChildLevel = '';
        } else if(listName === 'subChildLevelList') {
            fullList[index].subChildLevelList = newList;
            fullList[index].selectedSubChildLevel = '';
        }
        
        return  fullList;
    }
    
    function resetLeveAndGroupList(fullList, index, listName) {
        if(listName === 'childLevelList') {
            fullList[index].childLevelList = [];
            fullList[index].subChildLevelList = [];
            fullList[index].selectedParentLevel = '';
            fullList[index].selectedChildLevel = '';
            fullList[index].selectedSubChildLevel = '';
        } else if(listName === 'subChildLevelList') {
            fullList[index].subChildLevelList = [];
            fullList[index].selectedChildLevel = '';
            fullList[index].selectedSubChildLevel = '';
        }
        return fullList;
    }
    
    function setLevelId(fullList, index, listName){
        if(listName === 'childLevelList') {
            fullList[index].selectedLevel = '';
        } else if(listName === 'subChildLevelList') {
            fullList[index].selectedLevel = fullList[index].selectedParentLevel;
        } else if(listName === 'lastList') {
            fullList[index].selectedLevel = fullList[index].selectedChildLevel;
        }
    }
});